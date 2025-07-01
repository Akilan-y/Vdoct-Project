import React, { useContext, useState } from 'react'
import { assets } from '../assets/assets'
import { NavLink, useNavigate, Link, useLocation } from 'react-router-dom'
import { AppContext } from '../context/AppContext'

const navLinks = [
  { name: "Home", path: "/" },
  { name: "Doctors", path: "/doctors" },
  { name: "About", path: "/about" },
  { name: "Contact", path: "/contact" },
];

const Navbar = () => {

  const navigate = useNavigate()
  const location = useLocation()

  const [showMenu, setShowMenu] = useState(false)
  const { token, setToken, userData } = useContext(AppContext)

  const logout = () => {
    localStorage.removeItem('token')
    setToken('')
    navigate('/')
  }

  return (
    <header className="backdrop-blur bg-primary/60 shadow-lg shadow-primary/10 sticky top-0 z-20 mt-4 mx-2 rounded-xl border-b border-primary/20">
      <div className="container mx-auto px-4 py-[11px] flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-surface">vdoct</Link>
        <nav className="space-x-6 text-surface font-medium flex items-center">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`hover:text-blush transition ${location.pathname === link.path ? "text-blush font-semibold" : ""}`}
            >
              {link.name}
            </Link>
          ))}
          {token ? (
            <>
              <Link
                to="/my-appointments"
                className="ml-4 px-4 py-2 bg-accent text-white rounded hover:bg-primary transition shadow"
              >
                My Appointments
              </Link>
              <Link
                to="/my-profile"
                className="ml-2 px-4 py-2 bg-primary text-white rounded hover:bg-accent transition shadow"
              >
                Profile
              </Link>
              <button
                onClick={logout}
                className="ml-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition shadow"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="ml-4 px-4 py-2 bg-blush text-white rounded hover:bg-accent transition shadow"
            >
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Navbar