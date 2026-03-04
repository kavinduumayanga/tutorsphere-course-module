import { useState } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { GraduationCap, Menu, X, BookOpen, FolderOpen, Settings, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { path: '/courses', label: 'Courses', icon: BookOpen },
    { path: '/resources', label: 'Resources', icon: FolderOpen },
  ];

  if (user?.role === 'tutor') {
    navLinks.push({ path: '/tutor/manage-courses', label: 'Manage Courses', icon: Settings });
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/courses" className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <GraduationCap className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tight text-indigo-900">TutorSphere</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-semibold transition-colors ${
                  location.pathname === link.path
                    ? 'text-indigo-600'
                    : 'text-slate-500 hover:text-indigo-500'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-indigo-700 bg-indigo-50 px-4 py-2 rounded-full border border-indigo-100 flex items-center gap-2">
                  <User className="w-4 h-4" /> {user?.name}
                  <span className="text-[10px] uppercase tracking-wider text-indigo-400">
                    ({user?.role})
                  </span>
                </span>
                <button
                  onClick={handleLogout}
                  className="text-slate-400 hover:text-rose-500 p-2 rounded-lg hover:bg-rose-50 transition-all"
                  title="Sign out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-indigo-600 text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-slate-600"
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-3">
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsMenuOpen(false)}
              className="block w-full text-left text-slate-600 font-medium py-2"
            >
              {link.label}
            </Link>
          ))}
          {isAuthenticated ? (
            <button
              onClick={() => { handleLogout(); setIsMenuOpen(false); }}
              className="block w-full text-left text-rose-600 font-medium py-2"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              onClick={() => setIsMenuOpen(false)}
              className="block w-full bg-indigo-600 text-white px-5 py-3 rounded-xl text-sm font-bold text-center"
            >
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
