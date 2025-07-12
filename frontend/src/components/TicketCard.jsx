import React from 'react';
import TicketChat from './TicketChat';

const TicketCard = ({ 
  ticket, 
  canUpdateTickets, 
  canDeleteTickets, 
  onUpdateStatus, 
  onDelete 
}) => {
  return (
    <div className="ticket-card">
      <div className="ticket-header">
        <h3>{ticket.subject}</h3>
        <span className={`status ${ticket.state}`}>{ticket.state}</span>
      </div>
      {ticket.details && <p>{ticket.details}</p>}
      <div className="ticket-meta">
        <span>By: {ticket.person?.fullName}</span>
        <span>Company: {ticket.company?.title}</span>
        <span>{new Date(ticket.createdOn).toLocaleDateString()}</span>
      </div>
      
      {/* Chat Section */}
      <div className="ticket-chat-section">
        <TicketChat 
          ticketId={ticket.id} 
          ticketState={ticket.state}
          onMessageSent={() => {
            // Optionally refresh data or show notification
          }}
        />
      </div>
      
      <div className="ticket-actions">
        {canUpdateTickets && (
          <select
            value={ticket.state}
            onChange={(e) => onUpdateStatus(ticket.id, e.target.value)}
          >
            <option value="open">Open</option>
            <option value="pending">Pending</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        )}
        {canDeleteTickets && (
          <button 
            onClick={() => onDelete(ticket.id)}
            className="delete-btn"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
};

export default TicketCard;