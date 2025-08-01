import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-white shadow-md rounded-2xl max-w-6xl mx-auto w-full py-6 mt-8 mb-4 flex flex-col items-center animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-center items-center gap-4 text-text text-sm w-full">
        <div className="mb-2 md:mb-0">© {new Date().getFullYear()} <span className="font-semibold text-primary">vdoct</span>. All rights reserved.</div>
        <div className="flex space-x-4">
          <Link to="/privacy-policy" className="hover:text-accent underline">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-accent underline">Terms</Link>
          <Link to="/contact" className="hover:text-accent underline">Contact</Link>
        </div>
      </div>
    </footer>
  );
}
