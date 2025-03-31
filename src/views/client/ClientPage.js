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
import { workoutService } from '../../services/api';
import { teamService } from '../../services/api';

const ClientPage = () => {
  const { clientEmail } = useParams();
  const navigate = useNavigate();
  
  const [clientData, setClientData] = useState(null);
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  
  const [activeTab, setActiveTab] = useState('workout');

  const [workoutForm, setWorkoutForm] = useState({
    title: '',
    date: '',
    type: 'workout',
    warmup: '',
    exercises: [{
      id: 1,
      letter: 'A',
      title: '',
      metrics: [],
      video: null,
      videoUrl: ''
    }],
    cooldown: '',
    description: ''
  });

  const getNextLetter = (currentLetter) => {
    return String.fromCharCode(currentLetter.charCodeAt(0) + 1);
  };

  const handleAddExercise = () => {
    setWorkoutForm(prev => {
      const lastExercise = prev.exercises[prev.exercises.length - 1];
      const nextLetter = getNextLetter(lastExercise.letter);
      return {
        ...prev,
        exercises: [
          ...prev.exercises,
          {
            id: Date.now(),
            letter: nextLetter,
            title: '',
            metrics: [],
            video: null,
            videoUrl: ''
          }
        ]
      };
    });
  };

  const handleDeleteExercise = (exerciseId) => {
    setWorkoutForm(prev => {
      const filteredExercises = prev.exercises.filter(ex => ex.id !== exerciseId);
      
      const reorderedExercises = filteredExercises.map((exercise, index) => ({
        ...exercise,
        letter: String.fromCharCode(65 + index)
      }));

      return {
        ...prev,
        exercises: reorderedExercises
      };
    });
  };

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
        metrics: [],
        video: null,
        videoUrl: ''
      }],
      cooldown: '',
      description: ''
    });
    setShowWorkoutModal(true);
  };

  const handleEventClick = (arg) => {
    if (!arg.event || !arg.event.id) {
      console.error('Event data is missing');
      return;
    }

    const workout = workouts.find(w => w._id === arg.event.id);
    if (!workout) {
      console.error('Workout not found');
      return;
    }

    navigate(`/client/${clientEmail}/workout/${workout._id}`, { 
      state: { workout } 
    });
  };

  useEffect(() => {
    fetchClientData();
  }, [clientEmail]);

  const fetchClientData = async () => {
    try {
      const email = clientEmail;
      const response = await teamService.getClientByEmail(email);
      setClientData(response.data);
      await fetchWorkouts(response.data._id);
    } catch (error) {
      console.error('Error fetching client:', error);
      setError('Failed to fetch client data');
    }
  };

  const fetchWorkouts = async (clientId) => {
    try {
      const response = await teamService.getClientWorkouts(clientId);
      setWorkouts(response.data);
    } catch (error) {
      console.error('Error fetching workouts:', error);
      setError('Failed to fetch workouts');
    }
  };

  const handleSubmitWorkout = async (e) => {
    e.preventDefault();
    try {
      let response;
      if (selectedWorkout) {
        response = await workoutService.updateWorkout(selectedWorkout._id, workoutForm);
      } else {
        response = await workoutService.createWorkout({
          ...workoutForm,
          clientId: clientData._id
        });
      }
      
      await fetchWorkouts(clientData._id);
      
      setShowWorkoutModal(false);
      resetWorkoutForm();
    } catch (err) {
      setError('Failed to save workout');
      console.error(err);
    }
  };

  const resetWorkoutForm = () => {
    setWorkoutForm({
      title: '',
      date: '',
      type: 'workout',
      warmup: '',
      exercises: [{
        id: 1,
        letter: 'A',
        title: '',
        metrics: [],
        video: null,
        videoUrl: ''
      }],
      cooldown: '',
      description: ''
    });
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
                events={workouts?.filter(workout => workout != null).map(workout => ({
                  id: workout._id,
                  title: workout?.title ?? 'Untitled Workout',
                  date: workout?.date ?? new Date(),
                  allDay: true,
                  className: 'modern-event'
                })) ?? []}
                dateClick={handleDateClick}
                eventClick={handleEventClick}
                height="auto"
                headerToolbar={{
                  start: 'title',
                  center: '',
                  end: 'prev,next'
                }}
                dayHeaderFormat={{ 
                  weekday: window.innerWidth < 768 ? 'short' : 'long' 
                }}
                titleFormat={{ 
                  month: 'long', 
                  year: 'numeric' 
                }}
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
                contentHeight="auto"
                aspectRatio={1.35}
                handleWindowResize={true}
                stickyHeaderDates={true}
                expandRows={true}
              />
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

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
                    placeholder="Untitled Workout"
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

                      <div className="d-flex gap-2 mb-2">
                        <CFormInput
                          placeholder="Paste video URL"
                          value={exercise.videoUrl || ''}
                          onChange={(e) => {
                            setWorkoutForm(prev => ({
                              ...prev,
                              exercises: prev.exercises.map(ex =>
                                ex.id === exercise.id
                                  ? { ...ex, videoUrl: e.target.value }
                                  : ex
                              )
                            }));
                          }}
                          className="w-100"
                        />
                      </div>
                      
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
                    variant="outline" 
                    className="w-50 mb-2 mx-auto d-block"
                    onClick={handleAddExercise}
                  >
                    + Exercise
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
                    placeholder="Untitled Habit"
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