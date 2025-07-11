import React from 'react';

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <h3>{title}</h3>
        {children}
      </div>
    </div>
  );
};

export default Modal;