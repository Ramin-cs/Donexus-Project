import React from 'react';

const Header = ({ currentUser, handleLogout }) => {
  return (
    <header className="header">
      <h1>🎫 Ticketing System</h1>
      <div className="user-info">
        <span>Welcome, {currentUser?.fullName}</span>
        <span className="user-type">({currentUser?.userType})</span>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>
    </header>
  );
};

export default Header;