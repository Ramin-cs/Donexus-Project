import React, { useState, useEffect, useRef } from 'react';
import { messagesAPI } from '../api.js';
import './TicketChat.css';

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
        return <span className="badge admin-badge">Admin</span>;
      case 'SUPPORT':
        return <span className="badge support-badge">Support</span>;
      case 'NORMAL':
        return <span className="badge user-badge">User</span>;
      default:
        return null;
    }
  };

  const isOwnMessage = (senderId) => {
    // This would need to be passed from parent component
    return false; // Placeholder
  };

  if (loading && messages.length === 0) {
    return (
      <div className="chat-loading">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p>Loading messages...</p>
      </div>
    );
  }

  return (
    <div className="ticket-chat">
      <div className="chat-header">
        <div className="chat-title">
          <i className="fas fa-comments"></i>
          <h6 className="mb-0">Ticket Messages</h6>
        </div>
        {ticketState === 'closed' && (
          <span className="status-badge closed">Ticket Closed</span>
        )}
      </div>

      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="no-messages">
            <i className="fas fa-comment-slash"></i>
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <div className="messages-list">
            {messages.map((message) => (
              <div key={message.id} className={`message-item ${isOwnMessage(message.sender.id) ? 'own-message' : ''}`}>
                <div className="message-content">
                  <div className="message-header">
                    <div className="sender-info">
                      <strong className="sender-name">{message.sender.fullName}</strong>
                      {getSenderBadge(message.sender.userType)}
                    </div>
                    <small className="message-time">
                      {formatDate(message.createdAt)}
                    </small>
                  </div>
                  <div className="message-text">
                    {message.content}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {ticketState !== 'closed' && (
        <form onSubmit={handleSendMessage} className="message-form">
          <div className="input-group">
            <input
              type="text"
              className="form-control message-input"
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              disabled={loading}
            />
            <button
              type="submit"
              className="btn btn-primary send-btn"
              disabled={loading || !newMessage.trim()}
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-paper-plane"></i>
                  <span>Send</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {error && (
        <div className="alert alert-danger mt-2" role="alert">
          <i className="fas fa-exclamation-triangle"></i>
          {error}
        </div>
      )}
    </div>
  );
};

export default TicketChat;