import React from 'react';
import './EventModal.css';

const EventModal = ({ isOpen, onClose, onSave, selectedDate, currentEvent }) => {
  const [eventText, setEventText] = React.useState(currentEvent || '');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(eventText);
    setEventText('');
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Add Event for {selectedDate}</h3>
        <form onSubmit={handleSubmit}>
          <textarea
            value={eventText}
            onChange={(e) => setEventText(e.target.value)}
            placeholder="Enter event details..."
            rows="4"
          />
          <div className="modal-buttons">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventModal; 