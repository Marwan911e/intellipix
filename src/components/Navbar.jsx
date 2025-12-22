import { Link, useNavigate, useLocation } from "react-router-dom";
import { authAPI } from "../services/api";

function Navbar({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = () => {
    authAPI.login();
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="w-full border-b border-gray-100 bg-white">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Logo, Pricing and Upload */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2">
              <img
                src="/media/pix-logo.png"
                alt="IntelliPix Logo"
                className="h-8 w-auto"
              />
              {user && user.subscription_status === "active" && (
                <span className="text-xs font-medium bg-gray-900 text-white px-2 py-1 rounded">
                  pro
                </span>
              )}
            </Link>

            <div className="flex items-center gap-4">
              <Link
                to="/upload"
                className={`text-sm font-light px-4 py-2 rounded-lg transition-colors ${
                  isActive("/upload")
                    ? "bg-gray-900 text-white"
                    : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                Upload
              </Link>
              <Link
                to="/pricing"
                className={`text-sm font-light px-4 py-2 rounded-lg transition-colors ${
                  isActive("/pricing")
                    ? "bg-gray-900 text-white"
                    : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                Pricing
              </Link>
              <Link
                to="/api"
                className={`text-sm font-light px-4 py-2 rounded-lg transition-colors ${
                  isActive("/api") || isActive("/developer")
                    ? "bg-gray-900 text-white"
                    : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                Developer API
              </Link>
            </div>
          </div>

          {/* Right side - Login/Signup or User info */}
          <div className="flex items-center gap-4">
            {!user && (
              <div className="flex items-center gap-3">
                <button
                  onClick={handleLogin}
                  className="text-sm text-gray-700 hover:text-gray-900 font-light px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={handleLogin}
                  className="text-sm bg-gray-900 text-white font-light px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Sign Up
                </button>
              </div>
            )}

            {user && (
              <div className="flex items-center gap-3">
                <Link
                  to="/account"
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
                >
                  {user.picture && (
                    <img
                      src={user.picture}
                      alt={user.name}
                      className="w-8 h-8 rounded-full"
                    />
                  )}
                  <span className="text-sm text-gray-700 font-light">
                    {user.name}
                  </span>
                </Link>
                <button
                  onClick={onLogout}
                  className="text-sm text-gray-500 hover:text-gray-700 font-light"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
