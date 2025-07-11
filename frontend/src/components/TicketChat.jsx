import React, { useState, useEffect, useRef } from 'react';
import { messagesAPI } from '../api.js';

const TicketChat = ({ ticketId, ticketState, onMessageSent }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    loadMessages();
  }, [ticketId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const response = await messagesAPI.getMessages(ticketId);
      setMessages(response.data.messages);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      setLoading(true);
      const response = await messagesAPI.createMessage(ticketId, newMessage.trim());
      setMessages(prev => [...prev, response.data.message]);
      setNewMessage('');
      if (onMessageSent) {
        onMessageSent(response.data.message);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getSenderBadge = (userType) => {
    switch (userType) {
      case 'ADMIN':
        return <span className="badge bg-danger">Admin</span>;
      case 'SUPPORT':
        return <span className="badge bg-warning">Support</span>;
      case 'NORMAL':
        return <span className="badge bg-primary">User</span>;
      default:
        return null;
    }
  };

  if (loading && messages.length === 0) {
    return <div className="text-center p-3">Loading messages...</div>;
  }

  return (
    <div className="ticket-chat">
      <div className="chat-header">
        <h6 className="mb-0">Ticket Messages</h6>
        {ticketState === 'closed' && (
          <span className="badge bg-secondary">Ticket Closed</span>
        )}
      </div>

      <div className="messages-container" style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {messages.length === 0 ? (
          <div className="text-center text-muted p-3">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className="message-item mb-3">
              <div className="d-flex align-items-start">
                <div className="message-content flex-grow-1">
                  <div className="d-flex align-items-center mb-1">
                    <strong className="me-2">{message.sender.fullName}</strong>
                    {getSenderBadge(message.sender.userType)}
                    <small className="text-muted ms-auto">
                      {formatDate(message.createdAt)}
                    </small>
                  </div>
                  <div className="message-text p-2 bg-light rounded">
                    {message.content}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {ticketState !== 'closed' && (
        <form onSubmit={handleSendMessage} className="message-form mt-3">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              disabled={loading}
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !newMessage.trim()}
            >
              {loading ? 'Sending...' : 'Send'}
            </button>
          </div>
        </form>
      )}

      {error && (
        <div className="alert alert-danger mt-2" role="alert">
          {error}
        </div>
      )}
    </div>
  );
};

export default TicketChat;