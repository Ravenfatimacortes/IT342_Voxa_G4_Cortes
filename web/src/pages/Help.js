import React from 'react';

const Help = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Help Center</h1>
          
          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Frequently Asked Questions</h2>
              
              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h3 className="font-medium text-gray-900 mb-2">How do I take a survey?</h3>
                  <p className="text-gray-600">Navigate to your dashboard, click on "Available Surveys", and click the "Take Survey" button on any survey you wish to complete.</p>
                </div>
                
                <div className="border-l-4 border-blue-500 pl-4">
                  <h3 className="font-medium text-gray-900 mb-2">Can I save my progress and come back later?</h3>
                  <p className="text-gray-600">Yes, your progress is automatically saved. You can return to complete the survey at any time before the deadline.</p>
                </div>
                
                <div className="border-l-4 border-blue-500 pl-4">
                  <h3 className="font-medium text-gray-900 mb-2">How do I view my completed surveys?</h3>
                  <p className="text-gray-600">Go to the "Completed Surveys" tab in your dashboard to view all surveys you've submitted.</p>
                </div>
                
                <div className="border-l-4 border-blue-500 pl-4">
                  <h3 className="font-medium text-gray-900 mb-2">Is my feedback anonymous?</h3>
                  <p className="text-gray-600">Your responses are confidential and only shared in aggregate form with faculty and administrators.</p>
                </div>
              </div>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Support</h2>
              <p className="text-gray-600 mb-4">If you need additional help, please reach out to our support team:</p>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700"><strong>Email:</strong> support@voxa.edu</p>
                <p className="text-gray-700"><strong>Phone:</strong> (555) 123-4567</p>
                <p className="text-gray-700"><strong>Hours:</strong> Monday-Friday, 9:00 AM - 5:00 PM</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;
