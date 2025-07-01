import React, { useState } from 'react';
import { Plus, Tag, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

interface CreateRequestProps {
  onSubmit: (request: any) => void;
}

export default function CreateRequest({ onSubmit }: CreateRequestProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium',
    tags: '',
    estimatedTime: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.title.trim()) {
      alert('Please enter a title for your request');
      return;
    }
    
    if (!formData.description.trim()) {
      alert('Please provide a description of your request');
      return;
    }
    
    if (!formData.category) {
      alert('Please select a category for your request');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const requestData = {
        ...formData,
        title: formData.title.trim(),
        description: formData.description.trim(),
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };
      
      await onSubmit(requestData);
      
      // Reset form on success
      setFormData({
        title: '',
        description: '',
        category: '',
        priority: 'medium',
        tags: '',
        estimatedTime: ''
      });
    } catch (error) {
      console.error('Error submitting request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Create Help Request</h2>
          <p className="text-gray-600 mt-2">Get expert help by posting your request</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Request Title *
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Brief description of what you need help with"
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Detailed Description *
              </label>
              <textarea
                id="description"
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Provide detailed information about your request, including any specific issues or requirements"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  disabled={isSubmitting}
                >
                  <option value="">Select a category</option>
                  <option value="Excel">Excel</option>
                  <option value="Career">Career Development</option>
                  <option value="IT Support">IT Support</option>
                  <option value="Management">Management Advice</option>
                  <option value="Finance">Finance</option>
                  <option value="Process">Process Help</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                  Priority *
                </label>
                <select
                  id="priority"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isSubmitting}
                >
                  <option value="low">Low - Can wait a few days</option>
                  <option value="medium">Medium - Need help this week</option>
                  <option value="high">High - Need help today</option>
                  <option value="urgent">Urgent - Need immediate help</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <input
                  type="text"
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Separate tags with commas (e.g., VLOOKUP, formulas, data)"
                  disabled={isSubmitting}
                />
                <p className="text-sm text-gray-500 mt-1">Help experts find your request easier</p>
              </div>

              <div>
                <label htmlFor="estimatedTime" className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Time Needed
                </label>
                <select
                  id="estimatedTime"
                  value={formData.estimatedTime}
                  onChange={(e) => setFormData({ ...formData, estimatedTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isSubmitting}
                >
                  <option value="">Not sure</option>
                  <option value="5-15 minutes">5-15 minutes</option>
                  <option value="15-30 minutes">15-30 minutes</option>
                  <option value="30-60 minutes">30-60 minutes</option>
                  <option value="1-2 hours">1-2 hours</option>
                  <option value="Multiple sessions">Multiple sessions</option>
                </select>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Tips for better responses:</p>
                <ul className="list-disc list-inside space-y-1 text-blue-700">
                  <li>Be specific about what you've already tried</li>
                  <li>Include relevant file formats or software versions</li>
                  <li>Mention your deadline if time-sensitive</li>
                  <li>Add screenshots or examples if helpful</li>
                </ul>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-4 pt-4">
              <button
                type="button"
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                disabled={isSubmitting}
              >
                Save as Draft
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-emerald-500 text-white rounded-lg hover:from-blue-600 hover:to-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    <span>Post Request</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}