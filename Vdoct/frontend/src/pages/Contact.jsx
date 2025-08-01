import React from 'react';

const Contact = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-accent/5">
      {/* Hero Section */}
      <div className="relative w-full h-[320px] md:h-[400px] flex items-center justify-center overflow-hidden mb-20">
        <img
          src="https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=1200&q=80"
          alt="Modern hospital contact"
          className="absolute inset-0 w-full h-full object-cover object-center z-0"
        />
        <div className="absolute inset-0 bg-primary/60 backdrop-blur-sm z-10" />
        <div className="relative z-20 max-w-2xl mx-auto p-8 bg-white/90 rounded-3xl shadow-2xl flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">Get in <span className="text-accent">Touch</span></h1>
          <p className="text-lg text-text mb-2">
              Have questions? We'd love to hear from you. Reach out to us through any of the methods below.
            </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 pb-20">
        {/* Contact Methods + Image */}
        <div className="grid md:grid-cols-2 gap-16 items-center mb-24">
          {/* Contact Methods */}
          <div className="flex flex-col gap-8">
          {/* Phone */}
            <div className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-primary/10">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              </div>
              <h3 className="text-lg font-bold text-primary mb-2 group-hover:text-accent transition-colors">Call Us</h3>
              <a href="tel:+14155550132" className="text-base font-semibold text-accent hover:text-primary transition-colors">(415) 555-0132</a>
            </div>
            {/* Email */}
            <div className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-accent/10">
              <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-accent group-hover:text-white transition-all duration-300">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
          </div>
              <h3 className="text-lg font-bold text-accent mb-2 group-hover:text-primary transition-colors">Email Us</h3>
              <a href="mailto:support@vdoct.com" className="text-base font-semibold text-primary hover:text-accent transition-colors">support@vdoct.com</a>
            </div>
            {/* Location */}
            <div className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-primary/10">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 12.414a2 2 0 00-2.828 0l-4.243 4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </div>
              <h3 className="text-lg font-bold text-primary mb-2 group-hover:text-accent transition-colors">Visit Us</h3>
              <p className="text-base font-semibold text-accent">Rs puram, Coimbatore.</p>
            </div>
          </div>
          {/* Modern Contact Image */}
          <div className="flex justify-center items-center w-full">
            <img
              className="w-full max-w-md h-80 object-cover rounded-3xl shadow-xl border-4 border-white"
              src="https://images.unsplash.com/photo-1503676382389-4809596d5290?auto=format&fit=crop&w=800&q=80"
              alt="Contact our team modern"
            />
          </div>
        </div>

        {/* Office Hours and Emergency Contact */}
        <div className="grid lg:grid-cols-2 gap-12 mb-20">
          {/* Office Hours */}
          <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-3xl p-8 border border-primary/20">
            <h3 className="text-2xl font-bold text-primary mb-6">Office Hours</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-white/50 rounded-xl">
                <span className="text-text font-medium">Monday - Friday</span>
                <span className="text-primary font-semibold">9:00 AM - 6:00 PM</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-white/50 rounded-xl">
                <span className="text-text font-medium">Saturday</span>
                <span className="text-primary font-semibold">10:00 AM - 4:00 PM</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-white/50 rounded-xl">
                <span className="text-text font-medium">Sunday</span>
                <span className="text-accent font-semibold">Closed</span>
              </div>
            </div>
            <p className="text-text mt-6 text-sm">
              * We're closed on major holidays. For urgent matters outside business hours, please use our emergency contact.
            </p>
          </div>

          {/* Emergency Contact */}
          <div className="bg-gradient-to-br from-accent/10 to-primary/10 rounded-3xl p-8 border border-accent/20">
            <h3 className="text-2xl font-bold text-accent mb-6">Emergency Support</h3>
            <p className="text-text mb-6">
              For urgent technical issues or medical emergencies, please contact us immediately through our 24/7 emergency line.
            </p>
            <div className="flex items-center gap-4 p-6 bg-white/50 rounded-xl">
              <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-accent text-lg">24/7 Emergency Line</p>
                <a href="tel:+14155550133" className="text-2xl font-bold text-primary hover:text-accent transition-colors">
                  (415) 555-0133
                </a>
              </div>
            </div>
            <p className="text-text mt-4 text-sm">
              This line is monitored 24/7 for critical issues and medical emergencies.
            </p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-text max-w-2xl mx-auto">
              Find quick answers to common questions about our services.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 6v6m-4-6h8" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-primary mb-3">How do I book an appointment?</h4>
                  <p className="text-text">
                    Simply browse our doctors, select your preferred specialist, choose an available time slot, and complete your booking online.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-accent mb-3">Can I cancel my appointment?</h4>
                  <p className="text-text">
                    Yes, you can cancel or reschedule your appointment up to 24 hours before the scheduled time through your account dashboard.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-primary mb-3">What payment methods do you accept?</h4>
                  <p className="text-text">
                    We accept all major credit cards, debit cards, and digital payment methods including Razorpay and Stripe for secure transactions.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-accent mb-3">Is my medical information secure?</h4>
                  <p className="text-text">
                    Absolutely. We use industry-standard encryption and security measures to protect all your personal and medical information.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
