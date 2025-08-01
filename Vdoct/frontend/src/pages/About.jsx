import React from 'react';

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-accent/5">
      {/* Hero Section */}
      <div className="relative w-full h-[340px] md:h-[420px] flex items-center justify-center overflow-hidden mb-20">
        <img
          src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
          alt="Modern hospital lobby"
          className="absolute inset-0 w-full h-full object-cover object-center z-0"
        />
        <div className="absolute inset-0 bg-primary/60 backdrop-blur-sm z-10" />
        <div className="relative z-20 max-w-2xl mx-auto p-10 bg-white/90 rounded-3xl shadow-2xl flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">About <span className="text-accent">vdoct</span></h1>
          <p className="text-lg text-text">
            Your trusted partner in managing healthcare needs conveniently and efficiently. We bridge the gap between patients and healthcare providers.
            </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 pb-20">
        {/* Story & Mission Section */}
        <div className="grid md:grid-cols-2 gap-16 items-center mb-24">
          {/* Modern Image */}
          <div className="order-2 md:order-1 flex justify-center">
              <img 
              className="w-full max-w-md h-72 object-cover rounded-3xl shadow-xl border-4 border-white"
              src="https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?auto=format&fit=crop&w=600&q=80"
              alt="Healthcare team modern"
            />
          </div>
          {/* Story & Mission Text */}
          <div className="order-1 md:order-2 flex flex-col gap-8">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-2">Revolutionizing Healthcare Access</h2>
            <p className="text-text text-lg leading-relaxed mb-4">
              Welcome to vdoct, where we understand the challenges individuals face when it comes to scheduling doctor appointments and managing their health records. We're committed to excellence in healthcare technology, continuously striving to enhance our platform.
            </p>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-primary mb-2">Seamless Experience</h4>
                  <p className="text-text">We aim to create a seamless healthcare experience for every user, making it easier to access care when you need it.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-accent mb-2">Innovation Driven</h4>
                  <p className="text-text">Integrating the latest advancements to improve user experience and deliver superior service.</p>
                </div>
      </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-primary mb-2">Community Focus</h4>
                  <p className="text-text">Supporting you every step of the way, whether you're booking your first appointment or managing ongoing care.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-24">
          <div className="text-center bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="text-3xl font-bold text-primary mb-2">10K+</div>
            <div className="text-text font-medium">Happy Patients</div>
          </div>
          <div className="text-center bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="text-3xl font-bold text-accent mb-2">500+</div>
            <div className="text-text font-medium">Expert Doctors</div>
          </div>
          <div className="text-center bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="text-3xl font-bold text-primary mb-2">50+</div>
            <div className="text-text font-medium">Specialties</div>
          </div>
          <div className="text-center bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="text-3xl font-bold text-accent mb-2">24/7</div>
            <div className="text-text font-medium">Support</div>
          </div>
        </div>

        {/* Why Choose Us Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            Why Choose <span className="text-accent">vdoct</span>
          </h2>
          <p className="text-xl text-text max-w-2xl mx-auto">
            We provide comprehensive healthcare solutions designed to make your medical journey seamless and stress-free.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-24">
          <div className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-primary/10">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-all duration-300">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-primary mb-4 group-hover:text-accent transition-colors">Efficiency</h3>
            <p className="text-text leading-relaxed">
              Streamlined appointment scheduling that fits into your busy lifestyle. 
              Book appointments in seconds with our intuitive interface.
            </p>
          </div>

          <div className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-accent/10">
            <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-accent group-hover:text-white transition-all duration-300">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-accent mb-4 group-hover:text-primary transition-colors">Convenience</h3>
            <p className="text-text leading-relaxed">
              Access to a network of trusted healthcare professionals in your area. 
              Find the right specialist with just a few clicks.
            </p>
          </div>

          <div className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-primary/10">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-all duration-300">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-primary mb-4 group-hover:text-accent transition-colors">Personalization</h3>
            <p className="text-text leading-relaxed">
              Tailored recommendations and reminders to help you stay on top of your health. 
              Get personalized care plans and follow-up reminders.
            </p>
          </div>
        </div>

        {/* Mission & Vision Section */}
        <div className="grid lg:grid-cols-2 gap-12">
          <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-3xl p-8 border border-primary/20">
            <h3 className="text-2xl font-bold text-primary mb-6">Our Mission</h3>
            <p className="text-text leading-relaxed text-lg">
              To revolutionize healthcare access by providing innovative digital solutions that connect 
              patients with healthcare providers seamlessly, ensuring quality care is accessible to everyone.
            </p>
          </div>
          <div className="bg-gradient-to-br from-accent/10 to-primary/10 rounded-3xl p-8 border border-accent/20">
            <h3 className="text-2xl font-bold text-accent mb-6">Our Vision</h3>
            <p className="text-text leading-relaxed text-lg">
              To become the leading healthcare platform that transforms how people access and manage 
              their healthcare, creating a world where quality medical care is just a click away.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
