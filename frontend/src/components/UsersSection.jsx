import React from 'react';
import UserCard from './UserCard';
import Modal from './Modal';

const UsersSection = ({
  users,
  companies,
  canManageUsers,
  showCreateUser,
  setShowCreateUser,
  userForm,
  setUserForm,
  handleCreateUser,
  handleDeleteUser
}) => {
  return (
    <div className="users-section">
      <div className="section-header">
        <h2>Users ({users.length})</h2>
        <button onClick={() => setShowCreateUser(true)} className="create-btn">
          Create User
        </button>
      </div>

      <Modal 
        isOpen={showCreateUser}
        title="Create New User"
      >
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
      </Modal>

      <div className="users-grid">
        {users.map(user => (
          <UserCard
            key={user.id}
            user={user}
            canManageUsers={canManageUsers}
            onDelete={handleDeleteUser}
          />
        ))}
      </div>
    </div>
  );
};

export default UsersSection;