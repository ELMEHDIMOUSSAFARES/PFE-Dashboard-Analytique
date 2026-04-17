import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

// Layout
import Sidebar from "@/layout/Sidebar";
import Header from "@/layout/Header";

// Pages
import Dashboard from "@/pages/Dashboard";
import Analytics from "@/pages/Analytics";
import Users from "@/pages/Users";
import Login from "@/pages/Login";
import Messages from "@/pages/Messages";
import Settings from "@/pages/Settings";
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

  // 🔥 auth state (simple)
  const [isAuth, setIsAuth] = useState(false);

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* LOGIN */}
        <Route
          path="/login"
          element={
            <PageTransition>
              <Login onLogin={() => setIsAuth(true)} />
            </PageTransition>
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
                      <Route path="/messages" element={<Messages />} />
                      <Route path="/settings" element={<Settings />} />
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
