import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Home from "./pages/Home"
import Profiles from "./pages/Profiles"
import Users from "./pages/Users"
import Dashboard from "./pages/Dashboard"
import GroupDashboard from "./pages/GroupDashboard"
import Login from "./pages/Login"
import About from "./pages/About"
import Contact from "./pages/Contact"
import AppLayout from "./components/layout/AppLayout"
import { AuthProvider } from "./context/auth-context"
import ProtectedRoute from "./components/auth/ProtectedRoute"

import Reports from "./pages/Reports"

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes - Entry gated by Login */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/profiles" element={<Profiles />} />
              <Route path="/athletes" element={<Navigate to="/profiles" replace />} />
              <Route path="/users" element={<Users title="User Management" />} />
              <Route path="/sessions" element={<GroupDashboard />} />
              <Route path="/analytics" element={<Users title="Analytics" />} />
              <Route path="/reports" element={<Reports />} />
            </Route>
          </Route>

          {/* Catch-all - Redirect to Dashboard (which will trigger Login if needed) */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
