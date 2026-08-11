import "./globals.css";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/context/AuthContext";

export const metadata = {
  title: "Expense Tracker — Manage Your Finances",
  description:
    "A powerful expense tracker application to manage your personal income and expenses. Track transactions, categorize spending, and gain financial insights.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#1e2235",
                color: "#f1f5f9",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "0.75rem",
                fontSize: "0.875rem",
              },
              success: {
                iconTheme: {
                  primary: "#10b981",
                  secondary: "#1e2235",
                },
              },
              error: {
                iconTheme: {
                  primary: "#f43f5e",
                  secondary: "#1e2235",
                },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
