import React from 'react';
import PasswordStrength from './PasswordStrength';

const AuthForm = ({ 
  showLogin, 
  setShowLogin, 
  loginForm, 
  setLoginForm, 
  registerForm, 
  setRegisterForm, 
  handleLogin, 
  handleRegister, 
  error 
}) => {
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>🎫 Ticketing System</h1>
        
        <div className="auth-tabs">
          <button 
            className={showLogin ? 'active' : ''} 
            onClick={() => setShowLogin(true)}
          >
            Login
          </button>
          <button 
            className={!showLogin ? 'active' : ''} 
            onClick={() => setShowLogin(false)}
          >
            Register
          </button>
        </div>

        {error && <div className="error">{error}</div>}

        {showLogin ? (
          <form onSubmit={handleLogin} className="auth-form">
            <input
              type="email"
              placeholder="Email"
              value={loginForm.email}
              onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={loginForm.password}
              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
              required
            />
            <button type="submit">Login</button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="auth-form">
            <input
              type="text"
              placeholder="Full Name"
              value={registerForm.fullName}
              onChange={(e) => setRegisterForm({ ...registerForm, fullName: e.target.value })}
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={registerForm.email}
              onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={registerForm.password}
              onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
              required
            />
            <PasswordStrength password={registerForm.password} />
            <select
              value={registerForm.companyId}
              onChange={(e) => setRegisterForm({ ...registerForm, companyId: parseInt(e.target.value) })}
              required
            >
              <option value={1}>Acme Corp</option>
              <option value={2}>Globex Inc</option>
              <option value={3}>TechStart Solutions</option>
            </select>
            <button type="submit">Register</button>
          </form>
        )}

        <div className="auth-info">
          <p><strong>Test Accounts:</strong></p>
          <p>Admin: admin@acme.com / password123</p>
          <p>Support: support@acme.com / password123</p>
          <p>User: user1@acme.com / password123</p>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;