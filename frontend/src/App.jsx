import { useEffect, useState } from 'react';
import { authAPI, ticketsAPI, usersAPI, companiesAPI } from './api';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form states
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    fullName: '',
    email: '',
    password: '',
    companyId: 1
  });
  const [ticketForm, setTicketForm] = useState({ subject: '', details: '' });
  const [userForm, setUserForm] = useState({
    fullName: '',
    email: '',
    password: '',
    userType: 'NORMAL',
    companyId: 1
  });
  const [companyForm, setCompanyForm] = useState({ title: '' });

  // UI states
  const [activeTab, setActiveTab] = useState('tickets');
  const [showLogin, setShowLogin] = useState(true);
  const [showCreateTicket, setShowCreateTicket] = useState(false);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showCreateCompany, setShowCreateCompany] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (authAPI.isAuthenticated()) {
          const user = authAPI.getCurrentUser();
          setCurrentUser(user);
          setIsAuthenticated(true);
          await loadData();
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        handleLogout();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ticketsRes, usersRes, companiesRes] = await Promise.all([
        ticketsAPI.getTickets(),
        currentUser?.userType === 'ADMIN' ? usersAPI.getUsers() : Promise.resolve({ data: { users: [] } }),
        currentUser?.userType === 'ADMIN' ? companiesAPI.getCompanies() : Promise.resolve({ data: { companies: [] } })
      ]);

      setTickets(ticketsRes.data.tickets || []);
      setUsers(usersRes.data.users || []);
      setCompanies(companiesRes.data.companies || []);
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      const response = await authAPI.login(loginForm.email, loginForm.password);
      setCurrentUser(response.data.user);
      setIsAuthenticated(true);
      await loadData();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      const response = await authAPI.register(registerForm);
      setCurrentUser(response.data.user);
      setIsAuthenticated(true);
      await loadData();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleLogout = async () => {
    await authAPI.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setTickets([]);
    setUsers([]);
    setCompanies([]);
    setActiveTab('tickets');
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      await ticketsAPI.createTicket(ticketForm);
      setTicketForm({ subject: '', details: '' });
      setShowCreateTicket(false);
      await loadData();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleUpdateTicketStatus = async (ticketId, newStatus) => {
    try {
      await ticketsAPI.updateTicket(ticketId, { state: newStatus });
      await loadData();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDeleteTicket = async (ticketId) => {
    if (!confirm('Are you sure you want to delete this ticket?')) return;
    
    try {
      await ticketsAPI.deleteTicket(ticketId);
      await loadData();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      await usersAPI.createUser(userForm);
      setUserForm({
        fullName: '',
        email: '',
        password: '',
        userType: 'NORMAL',
        companyId: 1
      });
      setShowCreateUser(false);
      await loadData();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleCreateCompany = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      await companiesAPI.createCompany(companyForm);
      setCompanyForm({ title: '' });
      setShowCreateCompany(false);
      await loadData();
    } catch (error) {
      setError(error.message);
    }
  };

  const canManageUsers = currentUser?.userType === 'ADMIN';
  const canManageCompanies = currentUser?.userType === 'ADMIN';
  const canDeleteTickets = currentUser?.userType === 'ADMIN';
  const canUpdateTickets = currentUser?.userType === 'ADMIN' || currentUser?.userType === 'SUPPORT';

  if (loading) {
    return (
      <div className="app">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="app">
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
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <h1>🎫 Ticketing System</h1>
        <div className="user-info">
          <span>Welcome, {currentUser?.fullName}</span>
          <span className="user-type">({currentUser?.userType})</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </header>

      <nav className="nav">
        <button 
          className={activeTab === 'tickets' ? 'active' : ''} 
          onClick={() => setActiveTab('tickets')}
        >
          Tickets
        </button>
        {canManageUsers && (
          <button 
            className={activeTab === 'users' ? 'active' : ''} 
            onClick={() => setActiveTab('users')}
          >
            Users
          </button>
        )}
        {canManageCompanies && (
          <button 
            className={activeTab === 'companies' ? 'active' : ''} 
            onClick={() => setActiveTab('companies')}
          >
            Companies
          </button>
        )}
      </nav>

      <main className="main">
        {error && <div className="error">{error}</div>}

        {activeTab === 'tickets' && (
          <div className="tickets-section">
            <div className="section-header">
              <h2>Tickets ({tickets.length})</h2>
              <button onClick={() => setShowCreateTicket(true)} className="create-btn">
                Create Ticket
              </button>
            </div>

            {showCreateTicket && (
              <div className="modal">
                <div className="modal-content">
                  <h3>Create New Ticket</h3>
                  <form onSubmit={handleCreateTicket}>
                    <input
                      type="text"
                      placeholder="Subject"
                      value={ticketForm.subject}
                      onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                      required
                    />
                    <textarea
                      placeholder="Details"
                      value={ticketForm.details}
                      onChange={(e) => setTicketForm({ ...ticketForm, details: e.target.value })}
                    />
                    <div className="modal-actions">
                      <button type="submit">Create</button>
                      <button type="button" onClick={() => setShowCreateTicket(false)}>
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <div className="tickets-grid">
              {tickets.map(ticket => (
                <div key={ticket.id} className="ticket-card">
                  <div className="ticket-header">
                    <h3>{ticket.subject}</h3>
                    <span className={`status ${ticket.state}`}>{ticket.state}</span>
                  </div>
                  {ticket.details && <p>{ticket.details}</p>}
                  <div className="ticket-meta">
                    <span>By: {ticket.person?.fullName}</span>
                    <span>Company: {ticket.company?.title}</span>
                    <span>{new Date(ticket.createdOn).toLocaleDateString()}</span>
                  </div>
                  <div className="ticket-actions">
                    {canUpdateTickets && (
                      <select
                        value={ticket.state}
                        onChange={(e) => handleUpdateTicketStatus(ticket.id, e.target.value)}
                      >
                        <option value="open">Open</option>
                        <option value="pending">Pending</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                    )}
                    {canDeleteTickets && (
                      <button 
                        onClick={() => handleDeleteTicket(ticket.id)}
                        className="delete-btn"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'users' && canManageUsers && (
          <div className="users-section">
            <div className="section-header">
              <h2>Users ({users.length})</h2>
              <button onClick={() => setShowCreateUser(true)} className="create-btn">
                Create User
              </button>
            </div>

            {showCreateUser && (
              <div className="modal">
                <div className="modal-content">
                  <h3>Create New User</h3>
                  <form onSubmit={handleCreateUser}>
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={userForm.fullName}
                      onChange={(e) => setUserForm({ ...userForm, fullName: e.target.value })}
                      required
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={userForm.email}
                      onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                      required
                    />
                    <input
                      type="password"
                      placeholder="Password"
                      value={userForm.password}
                      onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                      required
                    />
                    <select
                      value={userForm.userType}
                      onChange={(e) => setUserForm({ ...userForm, userType: e.target.value })}
                    >
                      <option value="NORMAL">Normal User</option>
                      <option value="SUPPORT">Support</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                    <select
                      value={userForm.companyId}
                      onChange={(e) => setUserForm({ ...userForm, companyId: parseInt(e.target.value) })}
                    >
                      {companies.map(company => (
                        <option key={company.id} value={company.id}>
                          {company.title}
                        </option>
                      ))}
                    </select>
                    <div className="modal-actions">
                      <button type="submit">Create</button>
                      <button type="button" onClick={() => setShowCreateUser(false)}>
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <div className="users-grid">
              {users.map(user => (
                <div key={user.id} className="user-card">
                  <h3>{user.fullName}</h3>
                  <p>{user.emailAddress}</p>
                  <span className={`user-type ${user.userType.toLowerCase()}`}>
                    {user.userType}
                  </span>
                  <p>Company: {user.company?.title}</p>
                  <p>Last seen: {user.lastSeenAt ? new Date(user.lastSeenAt).toLocaleDateString() : 'Never'}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'companies' && canManageCompanies && (
          <div className="companies-section">
            <div className="section-header">
              <h2>Companies ({companies.length})</h2>
              <button onClick={() => setShowCreateCompany(true)} className="create-btn">
                Create Company
              </button>
            </div>

            {showCreateCompany && (
              <div className="modal">
                <div className="modal-content">
                  <h3>Create New Company</h3>
                  <form onSubmit={handleCreateCompany}>
                    <input
                      type="text"
                      placeholder="Company Name"
                      value={companyForm.title}
                      onChange={(e) => setCompanyForm({ ...companyForm, title: e.target.value })}
                      required
                    />
                    <div className="modal-actions">
                      <button type="submit">Create</button>
                      <button type="button" onClick={() => setShowCreateCompany(false)}>
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <div className="companies-grid">
              {companies.map(company => (
                <div key={company.id} className="company-card">
                  <h3>{company.title}</h3>
                  <p>Members: {company._count?.members || 0}</p>
                  <p>Tickets: {company._count?.issues || 0}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
