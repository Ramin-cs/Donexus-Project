import React from 'react';
import TicketCard from './TicketCard';
import Modal from './Modal';

const TicketsSection = ({
  tickets,
  canCreateTickets,
  canUpdateTickets,
  canDeleteTickets,
  showCreateTicket,
  setShowCreateTicket,
  ticketForm,
  setTicketForm,
  handleCreateTicket,
  handleUpdateTicketStatus,
  handleDeleteTicket
}) => {
  return (
    <div className="tickets-section">
      <div className="section-header">
        <h2>Tickets ({tickets.length})</h2>
        {canCreateTickets && (
          <button onClick={() => setShowCreateTicket(true)} className="create-btn">
            Create Ticket
          </button>
        )}
      </div>

      <Modal 
        isOpen={showCreateTicket}
        title="Create New Ticket"
      >
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
      </Modal>

      <div className="tickets-grid">
        {tickets.map(ticket => (
          <TicketCard
            key={ticket.id}
            ticket={ticket}
            canUpdateTickets={canUpdateTickets}
            canDeleteTickets={canDeleteTickets}
            onUpdateStatus={handleUpdateTicketStatus}
            onDelete={handleDeleteTicket}
          />
        ))}
      </div>
    </div>
  );
};

export default TicketsSection;