import React from 'react';
import { useParams } from 'react-router-dom'; // Import useParams to get the ID

export default function NotificationDetail() {
  const { id } = useParams(); // Get the 'id' from the URL

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Notification Detail</h1>
      <p className="text-gray-700">Displaying details for Notification ID: <span className="font-semibold text-blue-600">{id}</span></p>
      <p className="text-gray-500 mt-2">You would fetch and display the actual content for notification {id} here.</p>
      <div className="mt-4 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
        <p className="text-emerald-800">This page loads dynamically based on the URL!</p>
      </div>
    </div>
  );
}