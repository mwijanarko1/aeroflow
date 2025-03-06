import React from 'react';

export default function TestPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Test Page</h1>
      <p className="mb-4">This is a test page to check if routing is working.</p>
      <div className="mt-4">
        <a href="/" className="text-blue-600 hover:underline">Back to Home</a>
      </div>
    </div>
  );
} 