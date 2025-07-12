import React, { useState } from 'react';

const UserCard = ({ user, canManageUsers, onDelete, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: user.fullName,
    email: user.emailAddress,
    userType: user.userType,
    companyId: user.company?.id || 1
  });

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await onUpdate(user.id, editForm);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleCancel = () => {
    setEditForm({
      fullName: user.fullName,
      email: user.emailAddress,
      userType: user.userType,
      companyId: user.company?.id || 1
    });
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="user-card editing">
        <form onSubmit={handleSave}>
          <input
            type="text"
            placeholder="Full Name"
            value={editForm.fullName}
            onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={editForm.email}
            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
            required
          />
          <select
            value={editForm.userType}
            onChange={(e) => setEditForm({ ...editForm, userType: e.target.value })}
          >
            <option value="NORMAL">Normal User</option>
            <option value="SUPPORT">Support</option>
            <option value="ADMIN">Admin</option>
          </select>
          <div className="card-actions">
            <button type="submit" className="save-btn">Save</button>
            <button type="button" onClick={handleCancel} className="cancel-btn">Cancel</button>
          </div>
        </form>
      </div>
    );
  }

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
        <div className="card-actions">
          <button 
            onClick={handleEdit}
            className="edit-btn"
          >
            Edit User
          </button>
          <button 
            onClick={() => onDelete(user.id)}
            className="delete-btn"
          >
            Delete User
          </button>
        </div>
      )}
    </div>
  );
};

export default UserCard;