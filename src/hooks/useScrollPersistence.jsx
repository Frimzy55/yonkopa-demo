import { useRef, useCallback, useEffect } from "react";

export const useScrollPersistence = (navigation) => {
  const contentAreaRef = useRef(null);
  const scrollPositions = useRef({});

  const getScrollKey = useCallback(() => {
    const { activeMenu, activeSubMenu, activeNestedMenu, activeReportName } = navigation;

    if (activeReportName) return `Reports-${activeReportName}`;
    if (activeNestedMenu) return `${activeMenu}-${activeSubMenu}-${activeNestedMenu}`;
    if (activeSubMenu) return `${activeMenu}-${activeSubMenu}`;
    return activeMenu;
  }, [navigation]);

  const saveCurrentScrollPosition = useCallback(() => {
    if (!contentAreaRef.current) return;

    const key = getScrollKey();
    const value = contentAreaRef.current.scrollTop || 0;

    scrollPositions.current[key] = value;
    sessionStorage.setItem(`scroll_${key}`, String(value));
  }, [getScrollKey]);

  const restoreScrollPosition = useCallback(() => {
    if (!contentAreaRef.current) return;

    const key = getScrollKey();

    let saved =
      scrollPositions.current[key] ??
      parseInt(sessionStorage.getItem(`scroll_${key}`) || "0", 10);

    if (isNaN(saved)) saved = 0;

    requestAnimationFrame(() => {
      if (contentAreaRef.current) {
        contentAreaRef.current.scrollTop = saved;
      }
    });
  }, [getScrollKey]);

  useEffect(() => {
    const el = contentAreaRef.current;
    if (!el) return;

    const onScroll = () => saveCurrentScrollPosition();

    el.addEventListener("scroll", onScroll, { passive: true });

    return () => el.removeEventListener("scroll", onScroll);
  }, [saveCurrentScrollPosition]);

  useEffect(() => {
    restoreScrollPosition();
  }, [restoreScrollPosition]);

  return { contentAreaRef, saveCurrentScrollPosition };
};