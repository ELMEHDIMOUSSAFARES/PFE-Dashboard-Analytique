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
import Notifications from "@/pages/Notifications";

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
function ProtectedRoute({ isAuth, children }) {
  if (!isAuth) return <Navigate to="/login" replace />;
  return children;
}

function MainLayout() {
  const location = useLocation();

  // auth
  const [isAuth, setIsAuth] = useState(null); // null = loading

  useEffect(() => {
    const checkAuth = async () => {
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

  if (isAuth === null) {
    return <div>Loading...</div>;
  }

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* LOGIN */}
        <Route
          path="/login"
          element={
            isAuth ? (
              <Navigate to="/" replace />
            ) : (
              <PageTransition>
                <Login onLogin={() => (window.location.href = "/")} />
              </PageTransition>
            )
          }
        />

        {/* APP */}
        <Route
          path="/*"
          element={
            <ProtectedRoute isAuth={isAuth}>
              <div className="flex min-h-screen bg-gray-50 text-slate-900">
                <Sidebar />

                <div className="flex-1 flex flex-col ml-20">
                  <Header />

                  <main className="flex-1 overflow-y-auto p-6">
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/analytics" element={<Analytics />} />
                      <Route path="/users" element={<Users />} />
                      <Route
                        path="/notifications"
                        element={<Notifications />}
                      />

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
