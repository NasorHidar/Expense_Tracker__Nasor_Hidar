"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getInitials } from "@/lib/utils";
import {
  HiOutlineViewGrid,
  HiOutlineSwitchHorizontal,
  HiOutlineTag,
  HiOutlineLogout,
} from "react-icons/hi";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: HiOutlineViewGrid },
  { href: "/transactions", label: "Transactions", icon: HiOutlineSwitchHorizontal },
  { href: "/categories", label: "Categories", icon: HiOutlineTag },
];

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay ${isOpen ? "visible" : ""}`}
        onClick={onClose}
      />

      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h1 className="sidebar-logo">ExpenseTracker</h1>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-link ${isActive ? "active" : ""}`}
                onClick={onClose}
              >
                <Icon />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">
              {getInitials(user?.fullName)}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.fullName}</div>
              <div className="sidebar-user-email">{user?.email}</div>
            </div>
          </div>
          <button
            className="btn btn-ghost btn-full"
            onClick={logout}
            style={{ marginTop: "0.75rem" }}
          >
            <HiOutlineLogout /> Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
