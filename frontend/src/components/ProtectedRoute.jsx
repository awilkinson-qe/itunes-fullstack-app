// ProtectedRoute.jsx - Component for protecting routes based on authentication
// This component ensures that only authenticated users can access certain routes.
// If the user is not authenticated, they are redirected to the login page.
// While authentication state is being checked, a loading spinner is displayed.

import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children }) {
  // Get authentication state from context
  const { isAuthenticated, loading } = useAuth();

  // Show a loading state while checking token validity (/auth/me)
  if (loading) {
    return (
      <div className="container py-5 text-center text-white-50">
        <div className="spinner-border mb-3" role="status" aria-hidden="true" />
        <p className="mb-0">Checking your session...</p>
      </div>
    );
  }

  // Render protected content if authenticated, otherwise redirect to login
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export default ProtectedRoute;