import React from 'react';

const Navigation = ({ activeTab, setActiveTab, canManageUsers, canManageCompanies }) => {
  return (
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
  );
};

export default Navigation;