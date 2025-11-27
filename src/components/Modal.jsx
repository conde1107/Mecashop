import React from 'react';
import '../styles/modal.css';

const Modal = ({ open, title, onClose, children }) => {
  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;
