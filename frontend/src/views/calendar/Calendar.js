import React, { useState } from 'react';
import {
  CCard,
  CCardBody,
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CFormLabel,
  CFormSelect,
  CFormInput,
  CFormTextarea,
  CContainer,
  CRow,
  CCol
} from '@coreui/react';
import './Calendar.css';

const Calendar = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [events, setEvents] = useState({});
  const [visible, setVisible] = useState(false);
  const [workoutForm, setWorkoutForm] = useState({
    type: '',
    duration: '',
    notes: ''
  });
  
  // Get current date info
  const currentDate = new Date();
  const [currentMonth, setCurrentMonth] = useState(currentDate.getMonth());
  const [currentYear, setCurrentYear] = useState(currentDate.getFullYear());

  // Generate calendar days
  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  const handleDateClick = (dateKey) => {
    setSelectedDate(dateKey);
    setVisible(true);
    setWorkoutForm({ type: '', duration: '', notes: '' }); // Reset form
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setEvents(prev => ({
      ...prev,
      [selectedDate]: {
        type: workoutForm.type,
        duration: workoutForm.duration,
        notes: workoutForm.notes
      }
    }));
    setVisible(false);
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    // Add the days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${currentYear}-${currentMonth + 1}-${day}`;
      const event = events[dateKey];
      days.push(
        <div 
          key={day} 
          className={`calendar-day ${selectedDate === dateKey ? 'selected' : ''}`}
          onClick={() => handleDateClick(dateKey)}
        >
          <span className="day-number">{day}</span>
          {event && (
            <div className="event-indicator">
              <div className="workout-type">{event.type}</div>
              <div className="workout-duration">{event.duration} min</div>
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  const handleMonthChange = (increment) => {
    let newMonth = currentMonth + increment;
    let newYear = currentYear;

    if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    } else if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    }

    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <CContainer>
      <CCard className="mb-4">
        <CCardBody>
          <div className="calendar-container">
            <div className="calendar-header">
              <CButton 
                color="primary" 
                variant="outline"
                onClick={() => handleMonthChange(-1)}
              >
                &lt;
              </CButton>
              <h2>{monthNames[currentMonth]} {currentYear}</h2>
              <CButton 
                color="primary" 
                variant="outline"
                onClick={() => handleMonthChange(1)}
              >
                &gt;
              </CButton>
            </div>
            <div className="calendar-weekdays">
              <div>Sun</div>
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
            </div>
            <div className="calendar-grid">
              {renderCalendar()}
            </div>
          </div>

          <CModal
            visible={visible}
            onClose={() => setVisible(false)}
            alignment="center"
          >
            <CModalHeader onClose={() => setVisible(false)}>
              <CModalTitle>Add Workout for {selectedDate}</CModalTitle>
            </CModalHeader>
            <CModalBody>
              <CForm onSubmit={handleFormSubmit}>
                <div className="mb-3">
                  <CFormLabel>Workout Type</CFormLabel>
                  <CFormSelect
                    value={workoutForm.type}
                    onChange={(e) => setWorkoutForm({...workoutForm, type: e.target.value})}
                    required
                  >
                    <option value="">Select type</option>
                    <option value="Cardio">Cardio</option>
                    <option value="Strength">Strength</option>
                    <option value="Flexibility">Flexibility</option>
                    <option value="HIIT">HIIT</option>
                  </CFormSelect>
                </div>

                <div className="mb-3">
                  <CFormLabel>Duration (minutes)</CFormLabel>
                  <CFormInput
                    type="number"
                    value={workoutForm.duration}
                    onChange={(e) => setWorkoutForm({...workoutForm, duration: e.target.value})}
                    required
                    min="1"
                  />
                </div>

                <div className="mb-3">
                  <CFormLabel>Notes</CFormLabel>
                  <CFormTextarea
                    value={workoutForm.notes}
                    onChange={(e) => setWorkoutForm({...workoutForm, notes: e.target.value})}
                    rows="3"
                  />
                </div>
              </CForm>
            </CModalBody>
            <CModalFooter>
              <CButton color="secondary" onClick={() => setVisible(false)}>
                Close
              </CButton>
              <CButton color="primary" onClick={handleFormSubmit}>
                Save Workout
              </CButton>
            </CModalFooter>
          </CModal>
        </CCardBody>
      </CCard>
    </CContainer>
  );
};

export default Calendar;
