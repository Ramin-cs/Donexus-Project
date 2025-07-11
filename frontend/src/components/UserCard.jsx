import React from 'react';

const UserCard = ({ user, canManageUsers, onDelete }) => {
  return (
    <div className="user-card">
      <h3>{user.fullName}</h3>
      <p>{user.emailAddress}</p>
      <span className={`user-type ${user.userType.toLowerCase()}`}>
        {user.userType}
      </span>
      <p>Company: {user.company?.title}</p>
      <p>Last seen: {user.lastSeenAt ? new Date(user.lastSeenAt).toLocaleDateString() : 'Never'}</p>
      {canManageUsers && (
        <button 
          onClick={() => onDelete(user.id)}
          className="delete-btn"
        >
          Delete User
        </button>
      )}
    </div>
  );
};

export default UserCard;