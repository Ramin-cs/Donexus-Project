import React from 'react';
import CompanyCard from './CompanyCard';
import Modal from './Modal';

const CompaniesSection = ({
  companies,
  canManageCompanies,
  showCreateCompany,
  setShowCreateCompany,
  companyForm,
  setCompanyForm,
  handleCreateCompany,
  handleDeleteCompany,
  handleUpdateCompany
}) => {
  return (
    <div className="companies-section">
      <div className="section-header">
        <h2>Companies ({companies.length})</h2>
        <button onClick={() => setShowCreateCompany(true)} className="create-btn">
          Create Company
        </button>
      </div>

      <Modal 
        isOpen={showCreateCompany}
        title="Create New Company"
      >
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
      </Modal>

      <div className="companies-grid">
        {companies.map(company => (
          <CompanyCard
            key={company.id}
            company={company}
            canManageCompanies={canManageCompanies}
            onDelete={handleDeleteCompany}
            onUpdate={handleUpdateCompany}
          />
        ))}
      </div>
    </div>
  );
};

export default CompaniesSection;