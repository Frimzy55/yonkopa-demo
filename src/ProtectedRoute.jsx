import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const token = localStorage.getItem("token");
  const offlineMode =
    localStorage.getItem("offlineMode") === "true";

  let user = null;

  try {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      user = JSON.parse(storedUser);
    }
  } catch (error) {
    console.error("Invalid stored user data:", error);
    localStorage.removeItem("user");
  }

  const userRole = user?.role
    ?.toString()
    ?.trim()
    ?.toLowerCase();

  const normalizedAllowedRoles = allowedRoles.map((role) =>
    role?.toString()?.trim()?.toLowerCase()
  );

  /*
   * ONLINE AUTHENTICATION
   *
   * Normal login creates a JWT token.
   */
  const isOnlineAuthenticated =
    Boolean(token) && !offlineMode;

  /*
   * OFFLINE AUTHENTICATION
   *
   * Offline login creates:
   *
   * offlineMode = "true"
   *
   * and stores the authenticated user locally.
   */
  const isOfflineAuthenticated =
    offlineMode && Boolean(user);

  /*
   * Allow access when either:
   *
   * ONLINE:
   * token exists
   *
   * OR
   *
   * OFFLINE:
   * offlineMode is true and user exists
   */
  const isAuthenticated =
    isOnlineAuthenticated ||
    isOfflineAuthenticated;

  /*
   * Not authenticated
   */
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/officer-access"
        replace
      />
    );
  }

  /*
   * Check role
   */
  if (
    normalizedAllowedRoles.length > 0 &&
    !normalizedAllowedRoles.includes(userRole)
  ) {
    return (
      <Navigate
        to="/officer-access"
        replace
      />
    );
  }

  /*
   * Authentication successful
   */
  return children;
};

export default ProtectedRoute;