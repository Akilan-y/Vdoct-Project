import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="bg-background min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="flex flex-col md:flex-row items-center justify-between container mx-auto px-4 py-16 gap-8">
        <div className="flex-1">
          <h1 className="text-4xl md:text-5xl font-extrabold text-primary mb-4 leading-tight">
            Book Your Doctor Appointment Online
          </h1>
          <p className="text-lg text-text mb-8">
            Find the best doctors and book appointments in minutes. Trusted, easy, and secure.
          </p>
          <Link to="/doctors" className="inline-block px-8 py-3 bg-accent text-white font-semibold rounded shadow hover:bg-primary transition">
            Book Appointment
          </Link>
        </div>
        <div className="flex-1 flex justify-center">
          <img
            src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80"
            alt="Doctor and patient"
            className="rounded-2xl shadow-lg w-full max-w-md"
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-surface rounded-xl shadow p-6 flex flex-col items-center">
          <span className="text-3xl text-primary mb-2">✔️</span>
          <h3 className="font-bold text-lg mb-1 text-primary">Verified Doctors</h3>
          <p className="text-text text-center">All doctors are certified and highly rated by patients.</p>
        </div>
        <div className="bg-surface rounded-xl shadow p-6 flex flex-col items-center">
          <span className="text-3xl text-accent mb-2">📅</span>
          <h3 className="font-bold text-lg mb-1 text-primary">Easy Booking</h3>
          <p className="text-text text-center">Book appointments in just a few clicks, anytime.</p>
        </div>
        <div className="bg-surface rounded-xl shadow p-6 flex flex-col items-center">
          <span className="text-3xl text-success mb-2">🔒</span>
          <h3 className="font-bold text-lg mb-1 text-primary">Secure & Private</h3>
          <p className="text-text text-center">Your data and payments are always safe and encrypted.</p>
        </div>
        <div className="bg-surface rounded-xl shadow p-6 flex flex-col items-center">
          <span className="text-3xl text-blush mb-2">🕑</span>
          <h3 className="font-bold text-lg mb-1 text-primary">24/7 Support</h3>
          <p className="text-text text-center">We're here to help you at any time, any day.</p>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-primary mb-6">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center">
            <span className="text-4xl mb-2 text-accent">🔍</span>
            <h4 className="font-bold mb-1 text-primary">Search</h4>
            <p className="text-text text-center">Find doctors by specialty, name, or location.</p>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-4xl mb-2 text-primary">👨‍⚕️</span>
            <h4 className="font-bold mb-1 text-primary">Choose Doctor</h4>
            <p className="text-text text-center">View profiles, ratings, and select your doctor.</p>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-4xl mb-2 text-blush">📅</span>
            <h4 className="font-bold mb-1 text-primary">Book Appointment</h4>
            <p className="text-text text-center">Pick a time and confirm your booking instantly.</p>
          </div>
        </div>
      </section>
    </div>
  );
}