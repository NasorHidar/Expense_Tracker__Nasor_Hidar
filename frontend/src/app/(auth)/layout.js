export default function AuthLayout({ children }) {
  return (
    <div className="auth-layout">
      <div className="auth-container">
        <div className="auth-header">
          <h1 className="auth-logo">ExpenseTracker</h1>
          <p className="auth-subtitle">
            Take control of your finances
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
