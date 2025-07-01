import React, { useState, useRef } from 'react';
import { X, Upload, Download, AlertCircle, CheckCircle, FileText, Triangle as ExclamationTriangle } from 'lucide-react';
import Papa from 'papaparse';
import { dbHelpers, hasValidConfig } from '../../lib/supabase';

interface UserImportModalProps {
  onClose: () => void;
}

export default function UserImportModal({ onClose }: UserImportModalProps) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (selectedFile: File) => {
    if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
      setError('Please select a CSV file');
      return;
    }
    setFile(selectedFile);
    setError(null);
  };

  const processImport = async () => {
    if (!file) return;

    setImporting(true);
    setError(null);
    
    try {
      console.log('Starting CSV processing...');
      
      // Parse CSV file
      const parseResult = await new Promise<any>((resolve, reject) => {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: resolve,
          error: reject
        });
      });

      if (parseResult.errors && parseResult.errors.length > 0) {
        throw new Error('CSV parsing error: ' + parseResult.errors[0].message);
      }

      const csvData = parseResult.data;
      console.log('Parsed CSV data:', csvData);

      if (!csvData || csvData.length === 0) {
        throw new Error('No data found in CSV file');
      }

      // Validate required columns
      const requiredColumns = ['name', 'email', 'department', 'role'];
      const firstRow = csvData[0];
      const missingColumns = requiredColumns.filter(col => !(col in firstRow));
      
      if (missingColumns.length > 0) {
        throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
      }

      if (!hasValidConfig) {
        // Simulate import for demo
        console.log('Demo mode: simulating import');
        await new Promise(resolve => setTimeout(resolve, 2000));
        setResults({
          total: csvData.length,
          successful: csvData.length,
          failed: 0,
          errors: [],
          data: csvData.slice(0, 5)
        });
        return;
      }

      // Transform and validate data for database
      const usersToImport = csvData.map((row: any, index: number) => {
        const user = {
          name: row.name?.trim(),
          email: row.email?.trim().toLowerCase(),
          department: row.department?.trim(),
          role: row.role?.trim().toLowerCase(),
          expertise: row.expertise ? row.expertise.split(',').map((s: string) => s.trim()).filter(Boolean) : []
        };

        // Validate required fields
        if (!user.name) throw new Error(`Row ${index + 2}: Name is required`);
        if (!user.email) throw new Error(`Row ${index + 2}: Email is required`);
        if (!user.department) throw new Error(`Row ${index + 2}: Department is required`);
        if (!user.role) throw new Error(`Row ${index + 2}: Role is required`);
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(user.email)) {
          throw new Error(`Row ${index + 2}: Invalid email format: ${user.email}`);
        }

        // Validate role
        const validRoles = ['employee', 'expert', 'management', 'admin'];
        if (!validRoles.includes(user.role)) {
          throw new Error(`Row ${index + 2}: Invalid role "${user.role}". Must be one of: ${validRoles.join(', ')}`);
        }

        return user;
      });

      console.log('Users to import:', usersToImport);

      // Import to database using the NEW Edge Function
      const importResults = await dbHelpers.bulkImportUsers(usersToImport);
      
      console.log('Import results received:', importResults);
      
      setResults({
        total: csvData.length,
        successful: importResults.successful || 0,
        failed: importResults.failed || 0,
        errors: importResults.errors || [],
        data: csvData.slice(0, 5)
      });

    } catch (err: any) {
      console.error('Import error:', err);
      setError(err.message || 'Failed to import users');
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const template = `name,email,department,role,expertise
John Smith,john.smith@company.com,Marketing,employee,"Social Media, Content Creation"
Sarah Chen,sarah.chen@company.com,Data Analytics,expert,"Excel, Power BI, SQL"
Mike Johnson,mike.johnson@company.com,Operations,management,"Leadership, Process Optimization"
Lisa Thompson,lisa.thompson@company.com,Finance,expert,"Financial Analysis, Budget Planning"
David Park,david.park@company.com,Human Resources,management,"Career Development, Performance Reviews"`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'user_import_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Import Users</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-6 w-6 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {!results ? (
            <>
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <ExclamationTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div>
                      <p className="text-red-600 text-sm font-medium">Import Error</p>
                      <p className="text-red-600 text-sm mt-1">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {!hasValidConfig && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-yellow-800 text-sm font-medium">Demo Mode</p>
                      <p className="text-yellow-800 text-sm mt-1">
                        Database not configured. Import will be simulated for demonstration.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Upload CSV File</h3>
                  <button
                    onClick={downloadTemplate}
                    className="flex items-center space-x-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download Template</span>
                  </button>
                </div>
                
                <div
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                    dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    Drop your CSV file here, or{' '}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      browse
                    </button>
                  </p>
                  <p className="text-gray-600">Supports CSV files up to 10MB</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                </div>

                {file && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-blue-900">{file.name}</p>
                        <p className="text-sm text-blue-700">{(file.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">CSV Format Requirements:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li><strong>Required columns:</strong> name, email, department, role</li>
                      <li><strong>Optional columns:</strong> expertise (comma-separated)</li>
                      <li><strong>Role values:</strong> employee, expert, management, admin</li>
                      <li><strong>First row:</strong> Must contain column headers</li>
                      <li><strong>Email addresses:</strong> Must be unique and valid</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-4">
                <button
                  onClick={onClose}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={processImport}
                  disabled={!file || importing}
                  className={`flex items-center space-x-2 px-6 py-2 rounded-lg font-medium transition-all ${
                    file && !importing
                      ? 'bg-gradient-to-r from-blue-500 to-emerald-500 text-white hover:from-blue-600 hover:to-emerald-600'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {importing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      <span>Import Users</span>
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <CheckCircle className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Import Complete!</h3>
                <p className="text-gray-600">
                  {hasValidConfig 
                    ? 'User import process completed successfully'
                    : 'Import simulation completed (demo mode)'
                  }
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                  <p className="text-2xl font-bold text-emerald-600">{results.successful}</p>
                  <p className="text-sm text-emerald-800">Successful</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-2xl font-bold text-red-600">{results.failed}</p>
                  <p className="text-sm text-red-800">Failed</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-2xl font-bold text-blue-600">{results.total}</p>
                  <p className="text-sm text-blue-800">Total</p>
                </div>
              </div>

              {/* Show errors if any */}
              {results.errors && results.errors.length > 0 && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="font-medium text-red-900 mb-2">Import Errors:</h4>
                  <div className="max-h-32 overflow-y-auto">
                    <ul className="text-sm text-red-800 space-y-1">
                      {results.errors.map((error: string, index: number) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-red-600">•</span>
                          <span>{error}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {!hasValidConfig && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-800 text-sm">
                    <strong>Note:</strong> This was a demo simulation. To actually import users, please configure your Supabase database connection.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-center">
                <button
                  onClick={onClose}
                  className="px-8 py-3 bg-gradient-to-r from-blue-500 to-emerald-500 text-white rounded-lg hover:from-blue-600 hover:to-emerald-600 transition-all font-medium"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}