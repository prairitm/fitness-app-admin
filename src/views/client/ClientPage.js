import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CCard,
  CCardHeader,
  CCardBody,
  CRow,
  CCol,
  CButton,
  CSpinner,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CFormLabel,
  CFormInput,
  CFormTextarea,
  CAlert,
  CNav,
  CNavItem,
  CNavLink,
  CTabContent,
  CTabPane
} from '@coreui/react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import CIcon from '@coreui/icons-react';
import { cilPlus } from '@coreui/icons';
import './Calendar.css';

const ClientPage = () => {
  const { clientEmail } = useParams();
  const navigate = useNavigate();
  
  // Update state management to use localStorage
  const [clientData, setClientData] = useState(() => {
    const savedClients = JSON.parse(localStorage.getItem('coaches') || '[]');
    const client = savedClients
      .flatMap(coach => coach.clients)
      .find(client => client.email === clientEmail);
    return client || null;
  });

  const [workouts, setWorkouts] = useState(() => {
    const savedWorkouts = localStorage.getItem(`workouts_${clientEmail}`);
    return savedWorkouts ? JSON.parse(savedWorkouts) : [];
  });

  // Remove loading since we're not fetching from API
  const [error, setError] = useState(null);
  
  // Modal states
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  
  // Add new state for active tab
  const [activeTab, setActiveTab] = useState('workout');

  // Form state
  const [workoutForm, setWorkoutForm] = useState({
    title: '',
    date: '',
    type: 'workout',
    warmup: '',
    exercises: [{
      id: 1,
      letter: 'A',
      title: '',
      metrics: []
    }],
    cooldown: '',
    description: ''
  });

  // Add helper function to get next letter
  const getNextLetter = (currentLetter) => {
    return String.fromCharCode(currentLetter.charCodeAt(0) + 1);
  };

  // Add handler for adding new exercise
  const handleAddExercise = () => {
    setWorkoutForm(prev => {
      const lastExercise = prev.exercises[prev.exercises.length - 1];
      const nextLetter = getNextLetter(lastExercise.letter);
      return {
        ...prev,
        exercises: [
          ...prev.exercises,
          {
            id: Date.now(), // unique id for each exercise
            letter: nextLetter,
            title: '',
            metrics: []
          }
        ]
      };
    });
  };

  // Update the handleDeleteExercise function
  const handleDeleteExercise = (exerciseId) => {
    setWorkoutForm(prev => {
      // First filter out the deleted exercise
      const filteredExercises = prev.exercises.filter(ex => ex.id !== exerciseId);
      
      // Then reassign letters starting from 'A'
      const reorderedExercises = filteredExercises.map((exercise, index) => ({
        ...exercise,
        letter: String.fromCharCode(65 + index) // 65 is ASCII for 'A'
      }));

      return {
        ...prev,
        exercises: reorderedExercises
      };
    });
  };

  // Handle calendar date click
  const handleDateClick = (arg) => {
    setSelectedDate(arg.date);
    setSelectedWorkout(null);
    setWorkoutForm({
      title: '',
      date: arg.dateStr,
      type: 'workout',
      warmup: '',
      exercises: [{
        id: 1,
        letter: 'A',
        title: '',
        metrics: []
      }],
      cooldown: '',
      description: ''
    });
    setShowWorkoutModal(true);
  };

  // Update handleEventClick to include error handling
  const handleEventClick = (arg) => {
    if (!arg.event || !arg.event.id) {
      console.error('Event data is missing');
      return;
    }

    const workout = workouts.find(w => w.id === parseInt(arg.event.id) || w.id === arg.event.id);
    if (!workout) {
      console.error('Workout not found');
      return;
    }

    navigate(`/client/${clientEmail}/workout/${workout.id}`, { 
      state: { workout } 
    });
  };

  // Update handleSubmitWorkout function
  const handleSubmitWorkout = async (e) => {
    e.preventDefault();
    try {
      // Create workout object based on the active tab
      let workoutToSave = {
        id: selectedWorkout?.id || Date.now(),
        date: workoutForm.date,
        type: activeTab,
        clientEmail
      };

      // Add fields based on activity type
      switch (activeTab) {
        case 'workout':
          workoutToSave = {
            ...workoutToSave,
            title: workoutForm.title || 'Untitled Workout',
            warmup: workoutForm.warmup,
            exercises: workoutForm.exercises,
            cooldown: workoutForm.cooldown
          };
          break;
        case 'habit':
          workoutToSave = {
            ...workoutToSave,
            title: workoutForm.title || 'Untitled Habit',
            description: workoutForm.description
          };
          break;
        case 'rest':
          workoutToSave = {
            ...workoutToSave,
            title: 'Rest Day',
            description: workoutForm.description
          };
          break;
        default:
          break;
      }

      let updatedWorkouts;
      if (selectedWorkout) {
        updatedWorkouts = workouts.map(w => 
          w.id === selectedWorkout.id ? workoutToSave : w
        );
      } else {
        updatedWorkouts = [...workouts, workoutToSave];
      }

      setWorkouts(updatedWorkouts);
      localStorage.setItem(`workouts_${clientEmail}`, JSON.stringify(updatedWorkouts));
      setShowWorkoutModal(false);

      // Reset form after successful save
      setWorkoutForm({
        title: '',
        date: '',
        type: 'workout',
        warmup: '',
        exercises: [{
          id: 1,
          letter: 'A',
          title: '',
          metrics: []
        }],
        cooldown: '',
        description: ''
      });
    } catch (err) {
      setError('Failed to save workout');
      console.error(err);
    }
  };

  if (!clientData) {
    return <CAlert color="danger">Client not found</CAlert>;
  }

  if (error) {
    return <CAlert color="danger">{error}</CAlert>;
  }

  return (
    <>
      <CRow className="mb-4">
        <CCol>
          <CButton 
            color="primary" 
            variant="outline" 
            className="mb-3"
            onClick={() => navigate(-1)}
          >
            Back
          </CButton>
        </CCol>
      </CRow>

      <CRow className="mb-4">
        <CCol>
          <h2>{clientData?.name}'s Dashboard</h2>
        </CCol>
      </CRow>

      <CRow>
        <CCol>
          <CCard className="calendar-card">
            <CCardBody className="calendar-body">
              <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]} 
                initialView="dayGridMonth"
                events={workouts.map(workout => ({
                  id: workout.id.toString(),
                  title: workout.title,
                  date: workout.date,
                  allDay: true,
                  className: 'modern-event'
                }))}
                dateClick={handleDateClick}
                eventClick={handleEventClick}
                height="auto"
                headerToolbar={{
                  start: 'title',
                  center: '',
                  end: 'prev,next'
                }}
                dayHeaderFormat={{ weekday: 'long' }}
                titleFormat={{ month: 'long', year: 'numeric' }}
                firstDay={1}
                fixedWeekCount={false}
                showNonCurrentDates={false}
                eventDisplay="block"
                eventTimeFormat={{
                  hour: 'numeric',
                  minute: '2-digit',
                  meridiem: false
                }}
                dayHeaderClassNames="calendar-day-header"
              />
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Workout Modal */}
      <CModal
        visible={showWorkoutModal}
        onClose={() => setShowWorkoutModal(false)}
        size="lg"
      >
        <CForm onSubmit={handleSubmitWorkout}>
          <CModalHeader>
            <CModalTitle>
              {selectedWorkout ? 'Edit Activity' : 'Add New Activity'}
            </CModalTitle>
          </CModalHeader>
          <CModalBody>
            <CNav variant="tabs">
              <CNavItem>
                <CNavLink
                  active={activeTab === 'workout'}
                  onClick={() => {
                    setActiveTab('workout');
                    setWorkoutForm(prev => ({ ...prev, type: 'workout' }));
                  }}
                >
                  Workout
                </CNavLink>
              </CNavItem>
              <CNavItem>
                <CNavLink
                  active={activeTab === 'habit'}
                  onClick={() => {
                    setActiveTab('habit');
                    setWorkoutForm(prev => ({ ...prev, type: 'habit' }));
                  }}
                >
                  Habit
                </CNavLink>
              </CNavItem>
              <CNavItem>
                <CNavLink
                  active={activeTab === 'rest'}
                  onClick={() => {
                    setActiveTab('rest');
                    setWorkoutForm(prev => ({ ...prev, type: 'rest' }));
                  }}
                >
                  Rest Day
                </CNavLink>
              </CNavItem>
              <CNavItem>
                <CNavLink
                  active={activeTab === 'program'}
                  onClick={() => {
                    setActiveTab('program');
                    setWorkoutForm(prev => ({ ...prev, type: 'program' }));
                  }}
                >
                  From Programs
                </CNavLink>
              </CNavItem>
            </CNav>

            <CTabContent className="pt-4">
              <CTabPane visible={activeTab === 'workout'}>
                <div className="mb-3">
                  <CFormLabel>Name</CFormLabel>
                  <CFormInput
                    value={workoutForm.title}
                    onChange={(e) => setWorkoutForm({
                      ...workoutForm,
                      title: e.target.value
                    })}
                  />
                </div>

                <div className="mb-4">
                  <CFormLabel>Add warmup</CFormLabel>
                  <CFormTextarea
                    value={workoutForm.warmup || ''}
                    onChange={(e) => setWorkoutForm({
                      ...workoutForm,
                      warmup: e.target.value
                    })}
                    placeholder="Describe warmup activities"
                  />
                </div>

                <div className="mb-4">
                  {workoutForm.exercises.map((exercise, index) => (
                    <div key={exercise.id} className="mb-4">
                      <div className="d-flex align-items-center mb-2">
                        <h5 className="mb-0 me-2">{exercise.letter})</h5>
                        <CFormInput
                          placeholder="Exercise title (required)"
                          value={exercise.title}
                          onChange={(e) => {
                            setWorkoutForm(prev => ({
                              ...prev,
                              exercises: prev.exercises.map(ex =>
                                ex.id === exercise.id
                                  ? { ...ex, title: e.target.value }
                                  : ex
                              )
                            }));
                          }}
                          required
                        />
                        {workoutForm.exercises.length > 1 && (
                          <CButton
                            color="danger"
                            variant="ghost"
                            className="ms-2"
                            onClick={() => handleDeleteExercise(exercise.id)}
                          >
                            ×
                          </CButton>
                        )}
                      </div>
                      
                      <CButton 
                        color="primary" 
                        variant="outline" 
                        className="w-50 mb-2 mx-auto d-block"
                        onClick={() => {/* Handle adding metric */}}
                      >
                        Add metric
                      </CButton>
                      <small className="text-muted d-block mb-3">Sets, Reps, Tempo, Rest etc.</small>
                      <CFormInput
                        placeholder="Notes"
                        value={exercise.notes || ''}
                        onChange={(e) => {
                          setWorkoutForm(prev => ({
                            ...prev,
                            exercises: prev.exercises.map(ex =>
                              ex.id === exercise.id
                                ? { ...ex, notes: e.target.value }
                                : ex
                            )
                          }));
                        }}
                        className="mb-2"
                      />
                    </div>
                  ))}
                </div>

                <div className="d-flex gap-2 mb-3">
                  <CButton 
                    color="outline"
                    onClick={handleAddExercise}
                  >
                    + Exercise
                  </CButton>
                  <CButton 
                    color="outline"
                    onClick={() => {/* Handle adding circuit */}}
                  >
                    + Circuit
                  </CButton>
                </div>

                <div className="mb-3">
                  <CFormLabel>Add cooldown</CFormLabel>
                  <CFormTextarea
                    value={workoutForm.cooldown || ''}
                    onChange={(e) => setWorkoutForm({
                      ...workoutForm,
                      cooldown: e.target.value
                    })}
                    placeholder="Describe cooldown activities"
                  />
                </div>

                <div className="mb-3">
                  <CFormLabel>Date</CFormLabel>
                  <CFormInput
                    type="date"
                    value={workoutForm.date}
                    onChange={(e) => setWorkoutForm({
                      ...workoutForm,
                      date: e.target.value
                    })}
                    required
                  />
                </div>
              </CTabPane>

              <CTabPane visible={activeTab === 'habit'}>
                <div className="mb-3">
                  <CFormLabel>Habit Name</CFormLabel>
                  <CFormInput
                    value={workoutForm.title}
                    onChange={(e) => setWorkoutForm({
                      ...workoutForm,
                      title: e.target.value
                    })}
                    required
                  />
                </div>
                <div className="mb-3">
                  <CFormLabel>Notes</CFormLabel>
                  <CFormTextarea
                    value={workoutForm.description}
                    onChange={(e) => setWorkoutForm({
                      ...workoutForm,
                      description: e.target.value
                    })}
                  />
                </div>
                <div className="mb-3">
                  <CFormLabel>Date</CFormLabel>
                  <CFormInput
                    type="date"
                    value={workoutForm.date}
                    onChange={(e) => setWorkoutForm({
                      ...workoutForm,
                      date: e.target.value
                    })}
                    required
                  />
                </div>
              </CTabPane>

              <CTabPane visible={activeTab === 'rest'}>
                <div className="mb-3">
                  <CFormLabel>Date</CFormLabel>
                  <CFormInput
                    type="date"
                    value={workoutForm.date}
                    onChange={(e) => setWorkoutForm({
                      ...workoutForm,
                      date: e.target.value,
                      title: 'Rest Day'
                    })}
                    required
                  />
                </div>
                <div className="mb-3">
                  <CFormLabel>Notes</CFormLabel>
                  <CFormTextarea
                    value={workoutForm.description}
                    onChange={(e) => setWorkoutForm({
                      ...workoutForm,
                      description: e.target.value
                    })}
                  />
                </div>
              </CTabPane>

              <CTabPane visible={activeTab === 'program'}>
                <div className="text-center p-4">
                  <p>Program assignment feature coming soon!</p>
                </div>
              </CTabPane>
            </CTabContent>
          </CModalBody>
          <CModalFooter>
            <CButton 
              color="secondary" 
              onClick={() => setShowWorkoutModal(false)}
            >
              Cancel
            </CButton>
            <CButton 
              color="primary" 
              type="submit"
              disabled={activeTab === 'program'}
            >
              {selectedWorkout ? 'Update' : 'Add'} {activeTab === 'rest' ? 'Rest Day' : activeTab === 'habit' ? 'Habit' : 'Workout'}
            </CButton>
          </CModalFooter>
        </CForm>
      </CModal>
    </>
  );
};

export default ClientPage; 