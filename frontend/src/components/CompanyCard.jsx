import React from 'react';

const CompanyCard = ({ company, canManageCompanies, onDelete }) => {
  return (
    <div className="company-card">
      <h3>{company.title}</h3>
      <p>Members: {company._count?.members || 0}</p>
      <p>Tickets: {company._count?.issues || 0}</p>
      {canManageCompanies && (
        <button 
          onClick={() => onDelete(company.id)}
          className="delete-btn"
        >
          Delete Company
        </button>
      )}
    </div>
  );
};

export default CompanyCard;