import React from "react";
import Link from "next/link";
import { Text, Tooltip } from "@radix-ui/themes";
import { ChevronLeftIcon, PersonIcon } from "@radix-ui/react-icons";
import clsx from "clsx";

const NAV_ITEMS = [{ href: "/", label: "Candidates", icon: PersonIcon }] as const;

interface AppSidebarProps {
  /**
   * Whether the sidebar is in its narrow (icon-only) state.
   */
  collapsed: boolean;
  /**
   * Callback fired when the collapse/expand toggle button is clicked.
   */
  onToggle: () => void;
  /**
   * Current route pathname used to highlight the active nav item.
   */
  pathname: string;
}

function isActive(href: string, pathname: string): boolean {
  if (href === "/") {
    return pathname === "/" || pathname.startsWith("/candidates");
  }
  /* v8 ignore next -- NAV_ITEMS only contains href="/", this branch is unreachable */
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Collapsible navigation sidebar with app branding and route links.
 *
 * In expanded mode shows icon + label for each nav item. In collapsed mode
 * shows icons only with Radix `Tooltip` labels on hover. Active route is
 * highlighted via `aria-current="page"`. Controlled externally by `AppShell`.
 *
 * @author Martin Sandoval
 */
const AppSidebar: React.FC<AppSidebarProps> = ({ collapsed, onToggle, pathname }) => {
  return (
    <aside
      className={clsx("AppSidebar", { "AppSidebar--collapsed": collapsed })}
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div className="AppSidebarLogo">
        <div className="AppLogoMark">EL</div>
        <Text size="3" weight="bold" className="AppLogoText">
          EmiLabs
        </Text>
      </div>

      {/* Nav */}
      <nav className="AppSidebarNav">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(href, pathname);
          const link = (
            <Link
              href={href}
              className={clsx("AppNavItem", { "AppNavItem--active": active })}
              aria-current={active ? "page" : undefined}
              aria-label={label}
            >
              <span className="AppNavIcon">
                <Icon />
              </span>
              <span className="AppNavLabel">{label}</span>
            </Link>
          );

          if (collapsed) {
            return (
              <Tooltip key={href} content={label} side="right">
                {link}
              </Tooltip>
            );
          }
          return <React.Fragment key={href}>{link}</React.Fragment>;
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        className="AppSidebarToggle"
        onClick={onToggle}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <ChevronLeftIcon
          className={clsx("AppSidebarChevron", {
            "AppSidebarChevron--flipped": collapsed,
          })}
        />
      </button>
    </aside>
  );
};

export default AppSidebar;
