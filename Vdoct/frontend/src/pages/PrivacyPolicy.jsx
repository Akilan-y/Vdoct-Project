import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-accent/5 flex items-center justify-center py-16 px-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-10 sm:p-14 text-lg">
        <h1 className="text-3xl md:text-4xl font-bold text-primary mb-6">Privacy Policy</h1>
        <p className="mb-4">Your privacy is important to us. vdoct is committed to protecting your personal information and being transparent about how we use it. This policy explains what data we collect, how we use it, and your rights regarding your information.</p>
        <ul className="list-disc pl-5 space-y-2 mb-4">
          <li>We collect your name, email, phone number, and appointment details to provide our services.</li>
          <li>We may collect health-related information only as necessary for appointment booking and communication with healthcare providers.</li>
          <li>All data is encrypted and securely stored. We use industry-standard security measures to protect your information from unauthorized access.</li>
          <li>We do not sell, rent, or share your personal information with third parties for marketing purposes.</li>
          <li>We may share your data with healthcare providers only to facilitate your appointments and care.</li>
          <li>We may use anonymized data for analytics and service improvement.</li>
          <li>You have the right to access, update, or request deletion of your data at any time by contacting us at support@vdoct.com.</li>
          <li>We retain your data only as long as necessary to provide our services or as required by law.</li>
          <li>Our platform is not intended for children under 16. We do not knowingly collect data from minors.</li>
          <li>We may update this policy from time to time. Significant changes will be communicated via email or platform notification.</li>
        </ul>
        <p>For more details or questions, contact us at <a href="mailto:support@vdoct.com" className="text-blush underline">support@vdoct.com</a>.</p>
      </div>
    </div>
  );
} 