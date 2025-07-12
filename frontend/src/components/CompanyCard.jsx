import React, { useState } from 'react';

const CompanyCard = ({ company, canManageCompanies, onDelete, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: company.title
  });

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await onUpdate(company.id, editForm);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating company:', error);
    }
  };

  const handleCancel = () => {
    setEditForm({
      title: company.title
    });
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="company-card editing">
        <form onSubmit={handleSave}>
          <input
            type="text"
            placeholder="Company Name"
            value={editForm.title}
            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
            required
          />
          <div className="card-actions">
            <button type="submit" className="save-btn">Save</button>
            <button type="button" onClick={handleCancel} className="cancel-btn">Cancel</button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="company-card">
      <h3>{company.title}</h3>
      <p>Members: {company._count?.members || 0}</p>
      <p>Tickets: {company._count?.issues || 0}</p>
      {canManageCompanies && (
        <div className="card-actions">
          <button 
            onClick={handleEdit}
            className="edit-btn"
          >
            Edit Company
          </button>
          <button 
            onClick={() => onDelete(company.id)}
            className="delete-btn"
          >
            Delete Company
          </button>
        </div>
      )}
    </div>
  );
};

export default CompanyCard;