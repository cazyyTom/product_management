/**
 * usePageTitle.js
 *
 * Context + hooks that let any page set the Navbar title declaratively,
 * without prop-drilling through AppLayout.
 *
 * ── Provider ──────────────────────────────────────────────────────────────
 *   Wrap AppLayout (or the entire app) with <PageTitleProvider>.
 *
 * ── Hooks ─────────────────────────────────────────────────────────────────
 *   usePageTitle()      → { title }        (read — used by Navbar)
 *   useSetPageTitle(t)  → void             (write — used by page components)
 */

import { createContext, useContext, useState, useCallback, useEffect } from "react";

const PageTitleContext = createContext({ title: "Dashboard", setTitle: () => {} });

export function PageTitleProvider({ children }) {
  const [title, setTitleState] = useState("Dashboard");
  const setTitle = useCallback((t) => setTitleState(t), []);

  return (
    <PageTitleContext.Provider value={{ title, setTitle }}>
      {children}
    </PageTitleContext.Provider>
  );
}

/** Read the current title — consumed by Navbar / AppLayout. */
export function usePageTitle() {
  return useContext(PageTitleContext);
}

/** Set the page title from inside any page component. */
export function useSetPageTitle(title) {
  const { setTitle } = useContext(PageTitleContext);
  useEffect(() => {
    setTitle(title);
    // Also update the browser tab
    document.title = title ? `${title} — PBM Basecamp` : "PBM Basecamp";
  }, [title, setTitle]);
}
