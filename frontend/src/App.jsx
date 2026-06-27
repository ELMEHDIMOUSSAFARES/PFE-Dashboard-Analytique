import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect } from "react";

// Layout
import Sidebar from "@/layout/Sidebar";
import Header from "@/layout/Header";

// Pages
import Dashboard from "@/pages/Dashboard";
import Analytics from "@/pages/Analytics";
import Users from "@/pages/Users";
import Login from "@/pages/Login";
import Settings from "@/pages/Settings";
import Setup from "@/pages/Setup";

// Animation
function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  );
}

// 🔐 Protected Route
function ProtectedRoute({ isAuth, setupRequired, children }) {
  if (!isAuth) return <Navigate to={setupRequired ? "/setup" : "/login"} replace />;
  return children;
}

function MainLayout() {
  const location = useLocation();

  // auth
  const [isAuth, setIsAuth] = useState(null); // null = loading
  const [setupRequired, setSetupRequired] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const setupRes = await fetch("http://127.0.0.1:8000/auth/setup-status");
        const setupData = await setupRes.json();
        setSetupRequired(Boolean(setupData.setup_required));
      } catch {
        setSetupRequired(false);
      }

      const token = localStorage.getItem("token");

      if (!token || token === "undefined" || token === "null") {
        setIsAuth(false);
        return;
      }

      const res = await fetch("http://127.0.0.1:8000/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setIsAuth(true);
      } else {
        localStorage.removeItem("token");
        setIsAuth(false);
      }
    };

    checkAuth();
  }, []);

  if (isAuth === null || setupRequired === null) {
    return <div>Chargement...</div>;
  }

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* LOGIN */}
        <Route
          path="/login"
          element={
            setupRequired ? (
              <Navigate to="/setup" replace />
            ) : isAuth ? (
              <Navigate to="/" replace />
            ) : (
              <PageTransition>
                <Login onLogin={() => (window.location.href = "/")} />
              </PageTransition>
            )
          }
        />

        <Route
          path="/setup"
          element={
            setupRequired ? (
              <PageTransition>
                <Setup onSetupComplete={() => setSetupRequired(false)} />
              </PageTransition>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* APP */}
        <Route
          path="/*"
          element={
            <ProtectedRoute isAuth={isAuth} setupRequired={setupRequired}>
              <div className="flex min-h-screen bg-gray-50 text-slate-900">
                <Sidebar />

                <div className="flex-1 flex flex-col ml-20">
                  <Header />

                  <main className="flex-1 overflow-y-auto p-6">
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/analytics" element={<Analytics />} />
                      <Route path="/users" element={<Users />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </main>
                </div>
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

// App
export default function App() {
  return (
    <BrowserRouter>
      <MainLayout />
    </BrowserRouter>
  );
}
