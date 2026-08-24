import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const AutoLogout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const timeout = 15 * 60 * 1000;
    let timer;

    const getLoginRoute = () => {
      const currentPath = location.pathname;
      const loginRoutes = ["/officer-access", "/demo", "/signup"];

      // If we're already on a login page, stay there
      if (loginRoutes.includes(currentPath)) {
        return currentPath;
      }

      // Fallback to saved route or /demo
      const savedRoute = sessionStorage.getItem("loginRoute");
      return savedRoute || "/demo";
    };

    const logout = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.removeItem("loginRoute");
      navigate(getLoginRoute(), { replace: true });
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