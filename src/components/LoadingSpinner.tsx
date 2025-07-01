import React from 'react';
import { Users } from 'lucide-react';

export default function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 flex items-center justify-center">
      <div className="text-center">
        <div className="bg-gradient-to-r from-blue-500 to-emerald-500 p-4 rounded-2xl mb-4 mx-auto w-fit">
          <Users className="h-8 w-8 text-white animate-pulse" />
        </div>
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mx-auto mb-4"></div>
        <p className="text-gray-600">Loading ExpertConnect...</p>
      </div>
    </div>
  );
}