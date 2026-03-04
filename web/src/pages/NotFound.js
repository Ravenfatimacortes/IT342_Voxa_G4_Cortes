import React from 'react';
import { Link } from 'react-router-dom';
import { Home, FileQuestion } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center">
            <FileQuestion className="h-6 w-6 text-gray-600" />
          </div>
          <h1 className="mt-6 text-3xl font-extrabold text-gray-900">404</h1>
          <h2 className="mt-2 text-2xl font-bold text-gray-900">Page not found</h2>
          <p className="mt-2 text-sm text-gray-600">
            Sorry, we couldn't find the page you're looking for.
          </p>
          <div className="mt-6">
            <Link
              to="/dashboard"
              className="btn-primary inline-flex items-center"
            >
              <Home className="h-4 w-4 mr-2" />
              Go back home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
