import React, { useState } from "react";
import { Link } from "react-router-dom";

const privacyContent = (
  <div className="space-y-4">
    <h2 className="text-xl font-bold mb-2 text-primary">Privacy Policy</h2>
    <p>Your privacy is important to us. vdoct is committed to protecting your personal information and being transparent about how we use it. This policy explains what data we collect, how we use it, and your rights regarding your information.</p>
    <ul className="list-disc pl-5 space-y-1">
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
);

const termsContent = (
  <div className="space-y-4">
    <h2 className="text-xl font-bold mb-2 text-primary">Terms & Conditions</h2>
    <p>By using vdoct, you agree to abide by the following terms and conditions. Please read them carefully before using our platform.</p>
    <ul className="list-disc pl-5 space-y-1">
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
);

function Modal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-surface rounded-lg shadow-lg max-w-lg w-full p-6 relative animate-fadeIn max-h-[90vh] overflow-y-auto sm:my-10 my-4">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  );
}

export default function Footer() {
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  return (
    <footer className="bg-white border-t py-6 mt-8 mb-4 mx-2 rounded-xl">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-text text-sm">
        <div>© {new Date().getFullYear()} vdoct. All rights reserved.</div>
        <div className="flex space-x-4 mt-2 md:mt-0">
          <button onClick={() => setShowPrivacy(true)} className="hover:text-blush underline">Privacy Policy</button>
          <button onClick={() => setShowTerms(true)} className="hover:text-blush underline">Terms</button>
          <Link to="/contact" className="hover:text-blush underline">Contact</Link>
        </div>
      </div>
      <Modal open={showPrivacy} onClose={() => setShowPrivacy(false)}>{privacyContent}</Modal>
      <Modal open={showTerms} onClose={() => setShowTerms(false)}>{termsContent}</Modal>
    </footer>
  );
}

// Add a simple fadeIn animation
// In your index.css, you can add:
// @keyframes fadeIn { from { opacity: 0; transform: translateY(20px);} to { opacity: 1; transform: none;} }
// .animate-fadeIn { animation: fadeIn 0.2s ease; }
