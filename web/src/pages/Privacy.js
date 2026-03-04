import React from 'react';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
          
          <div className="prose max-w-none">
            <p className="text-gray-600 mb-4">Last updated: March 4, 2026</p>
            
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Information We Collect</h2>
              <p className="text-gray-600 mb-4">Voxa collects information to provide and improve our services. This includes:</p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Account information (name, email, student ID)</li>
                <li>Survey responses and feedback</li>
                <li>Usage data and analytics</li>
                <li>Device and browser information</li>
              </ul>
            </section>
            
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">How We Use Your Information</h2>
              <p className="text-gray-600 mb-4">We use your information to:</p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Provide and maintain our services</li>
                <li>Process survey responses</li>
                <li>Generate analytics and reports</li>
                <li>Communicate with you about your account</li>
                <li>Improve our platform and user experience</li>
              </ul>
            </section>
            
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Data Protection</h2>
              <p className="text-gray-600 mb-4">We implement appropriate security measures to protect your personal information, including:</p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Encryption of sensitive data</li>
                <li>Secure authentication systems</li>
                <li>Regular security audits</li>
                <li>Limited access to personal information</li>
              </ul>
            </section>
            
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Rights</h2>
              <p className="text-gray-600 mb-4">You have the right to:</p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Access your personal information</li>
                <li>Correct inaccurate information</li>
                <li>Request deletion of your account</li>
                <li>Opt-out of non-essential communications</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Us</h2>
              <p className="text-gray-600">If you have questions about this Privacy Policy, please contact us at privacy@voxa.edu</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
