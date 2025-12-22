import { useState, useEffect, useCallback } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Landing from "./pages/Landing";
import Upload from "./pages/Upload";
import Pricing from "./pages/Pricing";
import Account from "./pages/Account";
import DeveloperAPI from "./pages/DeveloperAPI";
import DeveloperAPILanding from "./pages/DeveloperAPILanding";
import { authAPI } from "./services/api";

function App() {
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const checkAuth = useCallback(async () => {
    setCheckingAuth(true);
    try {
      const userData = await authAPI.getMe();
      setUser(userData);
    } catch (error) {
      if (error.response?.status !== 401) {
        console.error("Auth check error:", error);
      }
      setUser(null);
    } finally {
      setCheckingAuth(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    const initAuth = async () => {
      await checkAuth();
    };
    initAuth();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Check payment success
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("payment") === "success") {
      window.history.replaceState({}, document.title, window.location.pathname);
      checkAuth();
    }
    if (urlParams.get("auth") === "success") {
      window.history.replaceState({}, document.title, window.location.pathname);
      checkAuth();
    }
  }, [checkAuth]);

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
    setUser(null);
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="h-screen bg-white flex flex-col overflow-hidden">
        <Navbar user={user} onLogout={handleLogout} />
        <div className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/upload" element={<Upload user={user} />} />
            <Route
              path="/pricing"
              element={<Pricing user={user} onUpgrade={() => checkAuth()} />}
            />
            <Route path="/account" element={<Account user={user} />} />
            <Route
              path="/developer"
              element={
                user ? (
                  <DeveloperAPI user={user} />
                ) : (
                  <DeveloperAPILanding />
                )
              }
            />
            <Route path="/api" element={<DeveloperAPILanding />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
