import React from 'react';

export default function Terms() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-accent/5 flex items-center justify-center py-16 px-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-10 sm:p-14 text-lg">
        <h1 className="text-3xl md:text-4xl font-bold text-primary mb-6">Terms &amp; Conditions</h1>
        <p className="mb-4">By using vdoct, you agree to abide by the following terms and conditions. Please read them carefully before using our platform.</p>
        <ul className="list-disc pl-5 space-y-2 mb-4">
          <li>You must provide accurate, complete, and up-to-date information when registering or booking appointments.</li>
          <li>Appointments are subject to doctor availability and may be rescheduled or canceled by the provider.</li>
          <li>vdoct is a technology platform that connects patients with healthcare providers. We do not provide medical advice or treatment.</li>
          <li>All payments (if any) are processed securely. vdoct is not responsible for payment disputes between users and providers.</li>
          <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
          <li>Any misuse of the platform, including fraudulent bookings or abusive behavior, may result in account suspension or termination.</li>
          <li>All content and materials on vdoct are the property of vdoct and may not be copied or distributed without permission.</li>
          <li>We reserve the right to update these terms at any time. Continued use of the platform constitutes acceptance of the revised terms.</li>
          <li>For urgent medical emergencies, always contact your local emergency services. vdoct is not a substitute for emergency care.</li>
          <li>If you have questions about these terms, contact us at <a href="mailto:support@vdoct.com" className="text-blush underline">support@vdoct.com</a>.</li>
        </ul>
      </div>
    </div>
  );
} 