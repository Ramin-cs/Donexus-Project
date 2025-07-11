import { useEffect, useState } from 'react';
import { authAPI, ticketsAPI, usersAPI, companiesAPI } from './api';
import AuthForm from './components/AuthForm';
import Header from './components/Header';
import Navigation from './components/Navigation';
import TicketsSection from './components/TicketsSection';
import UsersSection from './components/UsersSection';
import CompaniesSection from './components/CompaniesSection';
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

  // Reload data when tab changes
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      loadData();
    }
  }, [activeTab, isAuthenticated, currentUser]);

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

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await usersAPI.deleteUser(userId);
      await loadData();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDeleteCompany = async (companyId) => {
    if (!confirm('Are you sure you want to delete this company?')) return;
    
    try {
      await companiesAPI.deleteCompany(companyId);
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
  const canCreateTickets = currentUser?.userType === 'NORMAL';

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
        <AuthForm
          showLogin={showLogin}
          setShowLogin={setShowLogin}
          loginForm={loginForm}
          setLoginForm={setLoginForm}
          registerForm={registerForm}
          setRegisterForm={setRegisterForm}
          handleLogin={handleLogin}
          handleRegister={handleRegister}
          error={error}
        />
      </div>
    );
  }

  return (
    <div className="app">
      <Header currentUser={currentUser} handleLogout={handleLogout} />
      
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        canManageUsers={canManageUsers}
        canManageCompanies={canManageCompanies}
      />

      <main className="main">
        {error && <div className="error">{error}</div>}

        {activeTab === 'tickets' && (
          <TicketsSection
            tickets={tickets}
            canCreateTickets={canCreateTickets}
            canUpdateTickets={canUpdateTickets}
            canDeleteTickets={canDeleteTickets}
            showCreateTicket={showCreateTicket}
            setShowCreateTicket={setShowCreateTicket}
            ticketForm={ticketForm}
            setTicketForm={setTicketForm}
            handleCreateTicket={handleCreateTicket}
            handleUpdateTicketStatus={handleUpdateTicketStatus}
            handleDeleteTicket={handleDeleteTicket}
          />
        )}

        {activeTab === 'users' && canManageUsers && (
          <UsersSection
            users={users}
            companies={companies}
            canManageUsers={canManageUsers}
            showCreateUser={showCreateUser}
            setShowCreateUser={setShowCreateUser}
            userForm={userForm}
            setUserForm={setUserForm}
            handleCreateUser={handleCreateUser}
            handleDeleteUser={handleDeleteUser}
          />
        )}

        {activeTab === 'companies' && canManageCompanies && (
          <CompaniesSection
            companies={companies}
            canManageCompanies={canManageCompanies}
            showCreateCompany={showCreateCompany}
            setShowCreateCompany={setShowCreateCompany}
            companyForm={companyForm}
            setCompanyForm={setCompanyForm}
            handleCreateCompany={handleCreateCompany}
            handleDeleteCompany={handleDeleteCompany}
          />
        )}
      </main>
    </div>
  );
}

export default App;
