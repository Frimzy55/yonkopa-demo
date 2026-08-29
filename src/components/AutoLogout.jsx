import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const AutoLogout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const currentPath = location.pathname;

    // Public pages should not have an auto-logout timer.
    const publicRoutes = [
      "/",
      "/apply",
      "/demo",
      "/signup",
      "/officer-access",
      "/server-error",
    ];

    if (publicRoutes.includes(currentPath)) {
      return;
    }

    const timeout = 15 * 60 * 1000;
    let timer;

    const getLoginRoute = () => {
      // Admin and manager use StaffLoginPage
      if (
        currentPath === "/admin-dashboard" ||
        currentPath === "/loan-manager"
      ) {
        return "/demo";
      }

      // Officer-related dashboards use OfficerAccess
      if (
        currentPath === "/loan-officer-dashboard" ||
        currentPath === "/officer-dashboard" ||
        currentPath === "/loan-supervisor" ||
        currentPath === "/teller-dashboard"
      ) {
        return "/officer-access";
      }

      // Safe fallback
      return "/officer-access";
    };

    const logout = () => {
      const loginRoute = getLoginRoute();

      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("role");
      localStorage.removeItem("offlineMode");

      sessionStorage.removeItem("loginRoute");

      navigate(loginRoute, {
        replace: true,
        state: {
          message:
            "You have been logged out due to inactivity.",
        },
      });
    };

    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(logout, timeout);
    };

    resetTimer();

    const events = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
      "click",
    ];

    events.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    return () => {
      clearTimeout(timer);

      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [navigate, location.pathname]);

  return null;
};

export default AutoLogout;