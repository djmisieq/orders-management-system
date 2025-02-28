import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authService } from '../../services/auth';

const ProtectedRoute = ({ children, requiredRole }) => {
  const location = useLocation();
  
  const isAuthenticated = authService.isAuthenticated();
  const currentUser = authService.getCurrentUser();
  
  // Check if user is authenticated
  if (!isAuthenticated) {
    // Redirect to login page but save the attempted URL for redirection after login
    return <Navigate to="/login" state={{ from: location }} />;
  }
  
  // If a specific role is required, check if user has that role
  if (requiredRole && (!currentUser || currentUser.role !== requiredRole)) {
    // User doesn't have required role, redirect to unauthorized page
    return <Navigate to="/unauthorized" state={{ from: location }} />;
  }
  
  // User is authenticated and has required role (if specified)
  return children;
};

export default ProtectedRoute;