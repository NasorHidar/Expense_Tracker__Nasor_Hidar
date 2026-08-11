"use client";

import { useState } from "react";
import AuthGuard from "@/components/layout/AuthGuard";
import Sidebar from "@/components/layout/Sidebar";
import { HiOutlineMenu } from "react-icons/hi";

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AuthGuard>
      <div className="dashboard-layout">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="main-content">
          <header className="navbar">
            <div className="navbar-left">
              <button
                className="mobile-menu-btn"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open menu"
              >
                <HiOutlineMenu />
              </button>
            </div>
          </header>

          <div className="page-content fade-in">{children}</div>
        </main>
      </div>
    </AuthGuard>
  );
}
