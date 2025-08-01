import React, { useContext } from 'react';
import { assets } from '../assets/assets';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Doctors', path: '/doctors' },
  { name: 'About', path: '/about' },
  { name: 'Contact', path: '/contact' },
];

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { token, setToken } = useContext(AppContext);

  const logout = () => {
    localStorage.removeItem('token');
    setToken('');
    navigate('/');
  };

  return (
    <header className="bg-white shadow-md rounded-2xl mt-6 mb-4 mx-auto max-w-6xl w-full px-6 py-3 flex items-center justify-between sticky top-4 z-30 animate-fade-in-up">
      <Link to="/" className="flex items-center gap-2">
        <span className="text-2xl font-bold text-primary tracking-tight">vdoct</span>
      </Link>
      <nav className="flex-1 flex justify-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
            className={`text-base font-medium px-3 py-1 rounded-full transition-colors duration-200 ${location.pathname === link.path ? 'bg-accent text-white' : 'text-primary hover:bg-primary/10'}`}
            >
              {link.name}
            </Link>
          ))}
          {token && (
            <Link
              to="/meet"
            className={`text-base font-medium px-3 py-1 rounded-full transition-colors duration-200 flex items-center gap-1 ${location.pathname === '/meet' ? 'bg-accent text-white' : 'text-primary hover:bg-primary/10'}`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              Meet
            </Link>
          )}
      </nav>
      <div className="flex items-center gap-2">
          {token ? (
            <>
              <Link
                to="/my-profile"
              className="px-5 py-2 bg-primary text-white rounded-full font-semibold shadow hover:bg-accent transition"
              >
                Profile
              </Link>
              <button
                onClick={logout}
              className="px-5 py-2 bg-blush text-white rounded-full font-semibold shadow hover:bg-red-600 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
            className="px-5 py-2 bg-accent text-white rounded-full font-semibold shadow hover:bg-primary transition"
            >
              Login
            </Link>
          )}
      </div>
    </header>
  );
};

export default Navbar;