import React from 'react';

const Terms = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms of Use</h1>
          
          <div className="prose max-w-none">
            <p className="text-gray-600 mb-4">Last updated: March 4, 2026</p>
            
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Acceptance of Terms</h2>
              <p className="text-gray-600">By accessing and using Voxa, you accept and agree to be bound by these Terms of Use.</p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">User Responsibilities</h2>
              <p className="text-gray-600 mb-4">As a user of Voxa, you agree to:</p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Provide accurate and truthful information</li>
                <li>Submit honest and thoughtful survey responses</li>
                <li>Respect the privacy of other users</li>
                <li>Not attempt to manipulate survey results</li>
                <li>Report any technical issues or concerns</li>
              </ul>
            </section>
            
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Academic Integrity</h2>
              <p className="text-gray-600 mb-4">Voxa is designed for legitimate academic feedback purposes. Users must:</p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Complete surveys independently</li>
                <li>Provide genuine feedback based on personal experience</li>
                <li>Not share survey answers with others</li>
                <li>Not use automated tools to complete surveys</li>
              </ul>
            </section>
            
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Data Usage</h2>
              <p className="text-gray-600 mb-4">Survey responses may be used for:</p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Course improvement and development</li>
                <li>Academic research and analysis</li>
                <li>Institutional assessment</li>
                <li>Quality assurance purposes</li>
              </ul>
              <p className="text-gray-600 mt-4">All data is anonymized and aggregated before sharing.</p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Service Availability</h2>
              <p className="text-gray-600 mb-4">Voxa is provided "as is" and we do not guarantee uninterrupted service. We reserve the right to:</p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Modify or discontinue features</li>
                <li>Perform maintenance and updates</li>
                <li>Suspend accounts for policy violations</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
              <p className="text-gray-600">For questions about these Terms of Use, please contact us at legal@voxa.edu</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
