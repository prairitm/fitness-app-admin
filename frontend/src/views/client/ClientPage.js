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
import { v4 as uuid } from 'uuid';

// Add styles for superset exercises
const styles = `
  .superset-exercise {
    border-left: 4px solid #321fdb;
    background-color: rgba(50, 31, 219, 0.05);
  }
  
  .superset-header {
    border-bottom: 1px solid #e4e4e4;
    padding-bottom: 0.5rem;
  }
  
  .superset-footer {
    border-top: 1px solid #e4e4e4;
    padding-top: 0.5rem;
  }
  
  .exercise-block {
    transition: all 0.3s ease;
  }
  
  .exercise-block:hover {
    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  }
`;

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
    warmup: '',
    cooldown: '',
    date: '',
    exercises: [{
      id: uuid(),
      letter: 'A',
      title: '',
      sets: '',
      reps: '',
      weight: '',
      rpe: '',
      rest: '',
      videoUrl: '',
      notes: '',
      isSuperset: false,
      supersetGroup: null
    }]
  });

  // Add styles to document head
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  const getNextLetter = (currentLetter) => {
    return String.fromCharCode(currentLetter.charCodeAt(0) + 1);
  };

  const handleAddExercise = () => {
    setWorkoutForm(prev => {
      // Get all used letters (including those in supersets)
      const usedLetters = new Set(prev.exercises.map(ex => ex.letter));
      
      // Find the next available letter
      let nextLetter = 'A';
      while (usedLetters.has(nextLetter)) {
        nextLetter = getNextLetter(nextLetter);
      }
      
      return {
        ...prev,
        exercises: [
          ...prev.exercises,
          {
            id: uuid(),
            letter: nextLetter,
            title: '',
            sets: '',
            reps: '',
            weight: '',
            rpe: '',
            rest: '',
            videoUrl: '',
            notes: '',
            isSuperset: false,
            supersetGroup: null
          }
        ]
      };
    });
  };

  const handleAddSuperset = () => {
    setWorkoutForm(prev => {
      const lastExercise = prev.exercises[prev.exercises.length - 1];
      const nextLetter = getNextLetter(lastExercise.letter);
      const supersetGroup = uuid(); // Create a unique group ID for the superset
      
      // Add two exercises as a superset
      return {
        ...prev,
        exercises: [
          ...prev.exercises,
          {
            id: uuid(),
            letter: nextLetter,
            title: '',
            sets: '',
            reps: '',
            weight: '',
            rpe: '',
            rest: '',
            videoUrl: '',
            notes: '',
            isSuperset: true,
            supersetGroup: supersetGroup
          },
          {
            id: uuid(),
            letter: nextLetter + 'a', // Add 'a' to indicate it's part of the same superset
            title: '',
            sets: '',
            reps: '',
            weight: '',
            rpe: '',
            rest: '',
            videoUrl: '',
            notes: '',
            isSuperset: true,
            supersetGroup: supersetGroup
          }
        ]
      };
    });
  };

  const handleDeleteExercise = (exerciseId) => {
    setWorkoutForm(prev => {
      const exerciseToDelete = prev.exercises.find(ex => ex.id === exerciseId);
      let filteredExercises = prev.exercises.filter(ex => ex.id !== exerciseId);
      
      // If deleting a superset exercise, remove its partner
      if (exerciseToDelete.isSuperset && exerciseToDelete.supersetGroup) {
        filteredExercises = filteredExercises.filter(ex => 
          ex.id === exerciseId || 
          !ex.isSuperset || 
          ex.supersetGroup !== exerciseToDelete.supersetGroup
        );
      }
      
      // Get all used letters (including those in supersets)
      const usedLetters = new Set(filteredExercises.map(ex => ex.letter));
      
      // Reorder letters for non-superset exercises
      const reorderedExercises = filteredExercises.map((exercise, index) => {
        // If this exercise is part of a superset, keep its original letter
        if (exercise.isSuperset) {
          return exercise;
        }
        
        // For non-superset exercises, find the next available letter
        let letter = 'A';
        while (usedLetters.has(letter)) {
          letter = getNextLetter(letter);
        }
        usedLetters.add(letter);
        
        return {
          ...exercise,
          letter: letter,
          isSuperset: false,
          supersetGroup: null,
          supersetOrder: null
        };
      });

      return {
        ...prev,
        exercises: reorderedExercises
      };
    });
  };

  const handleCreateSuperset = (firstExerciseId, secondExerciseId) => {
    setWorkoutForm(prev => {
      const firstExerciseIndex = prev.exercises.findIndex(ex => ex.id === firstExerciseId);
      const secondExerciseIndex = prev.exercises.findIndex(ex => ex.id === secondExerciseId);
      
      if (firstExerciseIndex === -1 || secondExerciseIndex === -1) return prev;
      
      const supersetGroup = uuid();
      const firstExercise = prev.exercises[firstExerciseIndex];
      
      // Create updated exercises array
      const updatedExercises = prev.exercises.map((exercise, index) => {
        if (index === firstExerciseIndex) {
          return {
            ...exercise,
            isSuperset: true,
            supersetGroup: supersetGroup,
            supersetOrder: 1
          };
        } else if (index === secondExerciseIndex) {
          return {
            ...exercise,
            isSuperset: true,
            supersetGroup: supersetGroup,
            supersetOrder: 2,
            letter: firstExercise.letter // Use the same letter as the first exercise
          };
        }
        return exercise;
      });

      // Reorder letters for all exercises after the superset
      let currentLetter = firstExercise.letter;
      for (let i = secondExerciseIndex + 1; i < updatedExercises.length; i++) {
        currentLetter = getNextLetter(currentLetter);
        updatedExercises[i] = {
          ...updatedExercises[i],
          letter: currentLetter
        };
      }

      return {
        ...prev,
        exercises: updatedExercises
      };
    });
  };

  const handleDateClick = (arg) => {
    setSelectedDate(arg.date);
    setSelectedWorkout(null);
    setWorkoutForm({
      title: '',
      date: arg.dateStr,
      warmup: '',
      cooldown: '',
      exercises: [{
        id: uuid(),
        letter: 'A',
        title: '',
        sets: '',
        reps: '',
        weight: '',
        rpe: '',
        rest: '',
        videoUrl: '',
        notes: '',
        isSuperset: false,
        supersetGroup: null
      }],
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
      warmup: '',
      cooldown: '',
      exercises: [{
        id: uuid(),
        letter: 'A',
        title: '',
        sets: '',
        reps: '',
        weight: '',
        rpe: '',
        rest: '',
        videoUrl: '',
        notes: '',
        isSuperset: false,
        supersetGroup: null
      }],
    });
  };

  const updateExerciseField = (exerciseId, field, value) => {
    setWorkoutForm(prev => ({
      ...prev,
      exercises: prev.exercises.map(ex =>
        ex.id === exerciseId
          ? { ...ex, [field]: value }
          : ex
      )
    }));
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
              {/* <CNavItem>
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
              </CNavItem> */}
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
                    placeholder="Workout Title"
                  />
                </div>

                <div className="mb-4">
                  <CFormLabel>Warmup</CFormLabel>
                  <CFormTextarea
                    value={workoutForm.warmup || ''}
                    onChange={(e) => setWorkoutForm({
                      ...workoutForm,
                      warmup: e.target.value
                    })}
                    placeholder="Add warmup instructions"
                    rows={3}
                  />
                </div>

                <div className="mb-4">
                  {workoutForm.exercises.map((exercise, index) => {
                    const isFirstSupersetExercise = exercise.isSuperset && 
                      (!workoutForm.exercises[index - 1] || 
                       workoutForm.exercises[index - 1].supersetGroup !== exercise.supersetGroup);
                    
                    const isLastSupersetExercise = exercise.isSuperset && 
                      (!workoutForm.exercises[index + 1] || 
                       workoutForm.exercises[index + 1].supersetGroup !== exercise.supersetGroup);

                    return (
                      <React.Fragment key={exercise.id}>
                        <div 
                          className={`exercise-block p-3 border rounded mb-4 ${
                            exercise.isSuperset ? 'superset-exercise' : ''
                          }`}
                        >
                          {isFirstSupersetExercise && (
                            <div className="superset-header mb-3">
                              <h6 className="text-muted">Superset {exercise.letter}</h6>
                            </div>
                          )}
                          
                          <div className="d-flex align-items-center mb-3">
                            {/* <div className="drag-handle me-2">⋮⋮</div> */}
                            <h5 className="mb-0 me-2">
                              {exercise.letter}
                              {exercise.isSuperset ? (exercise.supersetOrder === 1 ? '1' : '2') : ''}
                              )
                            </h5>
                            <div className="flex-grow-1">
                              <CFormInput
                                placeholder="Search or enter exercise name"
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
                            </div>
                            <CButton
                              color="danger"
                              variant="ghost"
                              className="ms-2"
                              onClick={() => handleDeleteExercise(exercise.id)}
                            >
                              ×
                            </CButton>
                          </div>
{/* 
                          <div className="exercise-details mb-3">
                            <div className="row g-2">
                              <div className="col">
                                <CFormInput
                                  placeholder="Sets"
                                  type="number"
                                  value={exercise.sets || ''}
                                  onChange={(e) => updateExerciseField(exercise.id, 'sets', e.target.value)}
                                />
                              </div>
                              <div className="col">
                                <CFormInput
                                  placeholder="Reps"
                                  value={exercise.reps || ''}
                                  onChange={(e) => updateExerciseField(exercise.id, 'reps', e.target.value)}
                                />
                              </div>
                              <div className="col">
                                <CFormInput
                                  placeholder="Weight"
                                  value={exercise.weight || ''}
                                  onChange={(e) => updateExerciseField(exercise.id, 'weight', e.target.value)}
                                />
                              </div>
                              <div className="col">
                                <CFormInput
                                  placeholder="RPE"
                                  type="number"
                                  min="1"
                                  max="10"
                                  value={exercise.rpe || ''}
                                  onChange={(e) => updateExerciseField(exercise.id, 'rpe', e.target.value)}
                                />
                              </div>
                              <div className="col">
                                <CFormInput
                                  placeholder="Rest (sec)"
                                  type="number"
                                  value={exercise.rest || ''}
                                  onChange={(e) => updateExerciseField(exercise.id, 'rest', e.target.value)}
                                />
                              </div>
                            </div>
                          </div> */}

                          <div className="video-section mb-3">
                            <CFormInput
                              placeholder="Video URL"
                              value={exercise.videoUrl || ''}
                              onChange={(e) => updateExerciseField(exercise.id, 'videoUrl', e.target.value)}
                            />
                            {exercise.videoUrl && (
                              <div className="video-preview mt-2">
                                {/* Video thumbnail preview component */}
                              </div>
                            )}
                          </div>

                          <CFormTextarea
                            placeholder="Exercise instructions and coaching cues"
                            value={exercise.notes || ''}
                            onChange={(e) => updateExerciseField(exercise.id, 'notes', e.target.value)}
                            rows={2}
                          />

                          {isLastSupersetExercise && (
                            <div className="superset-footer mt-3">
                              <small className="text-muted">Perform these exercises back-to-back with minimal rest</small>
                            </div>
                          )}
                        </div>

                        {/* Add superset button between exercises if there's a next exercise */}
                        {index < workoutForm.exercises.length - 1 && !exercise.isSuperset && !workoutForm.exercises[index + 1].isSuperset && (
                          <div className="text-center mb-4">
                            <CButton
                              color="secondary"
                              variant="outline"
                              size="sm"
                              onClick={() => handleCreateSuperset(exercise.id, workoutForm.exercises[index + 1].id)}
                            >
                              Make Superset
                            </CButton>
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>

                <div className="exercise-actions mb-4">
                  <CButton 
                    color="primary" 
                    variant="outline" 
                    className="w-100"
                    onClick={handleAddExercise}
                  >
                    Add Exercise
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