"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import AppSidebar from "./AppSidebar";
import AppHeader from "./AppHeader";
import "./AppShell.css";

interface AppShellProps {
  /**
   * Page content rendered inside the main content area.
   */
  children: React.ReactNode;
}

/**
 * Top-level layout shell for the application.
 *
 * Composes the collapsible `AppSidebar` and the `AppHeader` around a main
 * content area. Manages sidebar collapsed/expanded state internally.
 * Wrap every page with this component via the root layout.
 *
 * @author Martin Sandoval
 */
const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <div className="AppShellRoot">
      <a href="#main-content" className="SkipToContent">
        Skip to main content
      </a>
      <AppSidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
        pathname={pathname}
      />
      <div className="AppShellBody">
        <AppHeader />
        <main id="main-content" className="AppShellContent">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppShell;
