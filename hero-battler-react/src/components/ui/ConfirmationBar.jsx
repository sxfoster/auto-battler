import React from 'react';

export default function ConfirmationBar({ onConfirm }) {
  return (
    <div className="confirmation-bar visible">
      <button className="confirm-button" onClick={onConfirm}>Start Battle</button>
    </div>
  );
}
