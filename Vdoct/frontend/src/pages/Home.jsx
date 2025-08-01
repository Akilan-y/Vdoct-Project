import React from "react";
import { Link } from "react-router-dom";
// assets import is no longer needed since group_profiles is not used

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] w-full px-4 py-12 animate-fade-in-up">
      <div className="flex flex-col md:flex-row items-center gap-12 w-full max-w-5xl bg-white/80 rounded-3xl shadow-lg p-8 md:p-16">
        {/* Left: Text */}
        <div className="flex-1 flex flex-col items-start justify-center gap-6">
          <h1 className="text-4xl md:text-5xl font-extrabold text-primary leading-tight">
            Your Health, <span className="text-accent">One Click</span> Away
          </h1>
          <p className="text-lg text-text max-w-md">
            Book appointments with trusted doctors in seconds. Simple, secure, and designed for you.
          </p>
          <Link
            to="/doctors"
            className="mt-2 px-8 py-3 bg-accent text-white font-semibold rounded-full shadow hover:bg-primary transition text-lg"
          >
            Book Appointment
          </Link>
        </div>
        {/* Right: Illustration */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <img
            src="https://images.unsplash.com/photo-1504439468489-c8920d796a29?auto=format&fit=crop&w=600&q=80"
            alt="Modern hospital building"
            className="w-full max-w-xs md:max-w-sm rounded-2xl shadow-md"
          />
          </div>
        </div>
    </div>
  );
}