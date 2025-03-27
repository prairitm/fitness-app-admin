import React, { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  CCard,
  CCardHeader,
  CCardBody,
  CButton,
  CRow,
  CCol,
  CListGroup,
  CListGroupItem,
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
  CFormTextarea,
  CFormInput,
} from '@coreui/react';

const WorkoutDetailPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { clientEmail } = useParams();
  const { workout } = location.state;
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedWorkout, setEditedWorkout] = useState(workout);

  const handleDelete = () => {
    try {
      // Get current workouts from localStorage
      const savedWorkouts = JSON.parse(localStorage.getItem(`workouts_${clientEmail}`) || '[]');
      
      // Filter out the current workout
      const updatedWorkouts = savedWorkouts.filter(w => w.id !== workout.id);
      
      // Save back to localStorage
      localStorage.setItem(`workouts_${clientEmail}`, JSON.stringify(updatedWorkouts));
      
      // Navigate back
      navigate(-1);
    } catch (error) {
      console.error('Failed to delete workout:', error);
    }
  };

  const handleSave = () => {
    try {
      const savedWorkouts = JSON.parse(localStorage.getItem(`workouts_${clientEmail}`) || '[]');
      const updatedWorkouts = savedWorkouts.map(w => 
        w.id === workout.id ? editedWorkout : w
      );
      localStorage.setItem(`workouts_${clientEmail}`, JSON.stringify(updatedWorkouts));
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save workout:', error);
    }
  };

  const renderExerciseVideo = (exercise) => {
    if (exercise.videoUrl) {
      // Handle YouTube URLs
      if (exercise.videoUrl.includes('youtube.com') || exercise.videoUrl.includes('youtu.be')) {
        const videoId = exercise.videoUrl.split('v=')[1] || exercise.videoUrl.split('/').pop();
        return (
          <div className="exercise-video mb-3">
            <iframe
              width="100%"
              height="315"
              src={`https://www.youtube.com/embed/${videoId}`}
              title={`Exercise ${exercise.letter} video`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        );
      }
      // Handle direct video URLs
      return (
        <div className="exercise-video mb-3">
          <video
            controls
            width="100%"
            src={exercise.videoUrl}
            style={{ maxHeight: '315px' }}
          >
            Your browser does not support the video tag.
          </video>
        </div>
      );
    }
    return null;
  };

  // Add helper function to get next letter
  const getNextLetter = (currentLetter) => {
    return String.fromCharCode(currentLetter.charCodeAt(0) + 1);
  };

  // Updated handleAddExercise to properly handle the state
  const handleAddExercise = () => {
    setEditedWorkout(prev => {
      const exercises = prev.exercises || [];
      const lastExercise = exercises[exercises.length - 1];
      const nextLetter = lastExercise 
        ? getNextLetter(lastExercise.letter)
        : 'A';

      return {
        ...prev,
        exercises: [
          ...exercises,
          {
            id: Date.now(),
            letter: nextLetter,
            title: '',
            metrics: [],
            videoUrl: '',
            notes: ''
          }
        ]
      };
    });
  };

  // Updated handleDeleteExercise with proper state management
  const handleDeleteExercise = (exerciseId) => {
    setEditedWorkout(prev => {
      const exercises = prev.exercises || [];
      const filteredExercises = exercises.filter(ex => ex.id !== exerciseId);
      
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

  const renderContent = () => {
    switch (editedWorkout.type) {
      case 'workout':
        return (
          <>
            <div className="mb-4">
              <h4>Warmup</h4>
              {isEditing ? (
                <CFormTextarea
                  value={editedWorkout.warmup || ''}
                  onChange={(e) => setEditedWorkout({
                    ...editedWorkout,
                    warmup: e.target.value
                  })}
                />
              ) : (
                <p>{editedWorkout.warmup}</p>
              )}
            </div>

            <div className="mb-4">
              <h4>Exercises</h4>
              <CListGroup>
                {(editedWorkout.exercises || []).map((exercise, index) => (
                  <CListGroupItem key={exercise.id || index}>
                    <div className="d-flex align-items-center mb-2">
                      <h5 className="mb-0 me-2">{exercise.letter})</h5>
                      {isEditing ? (
                        <div className="d-flex w-100 gap-2">
                          <CFormInput
                            placeholder="Exercise title (required)"
                            value={exercise.title || ''}
                            onChange={(e) => {
                              const updatedExercises = [...(editedWorkout.exercises || [])];
                              updatedExercises[index] = {
                                ...exercise,
                                title: e.target.value
                              };
                              setEditedWorkout({
                                ...editedWorkout,
                                exercises: updatedExercises
                              });
                            }}
                          />
                          {(editedWorkout.exercises || []).length > 1 && (
                            <CButton
                              color="danger"
                              variant="ghost"
                              onClick={() => handleDeleteExercise(exercise.id)}
                            >
                              ×
                            </CButton>
                          )}
                        </div>
                      ) : (
                        <strong>{exercise.title}</strong>
                      )}
                    </div>

                    {/* Video section */}
                    {isEditing ? (
                      <div className="ms-4 mb-3">
                        <CFormInput
                          placeholder="Paste video URL"
                          value={exercise.videoUrl || ''}
                          onChange={(e) => {
                            const updatedExercises = [...(editedWorkout.exercises || [])];
                            updatedExercises[index] = {
                              ...exercise,
                              videoUrl: e.target.value
                            };
                            setEditedWorkout({
                              ...editedWorkout,
                              exercises: updatedExercises
                            });
                          }}
                        />
                      </div>
                    ) : (
                      <div className="ms-4">
                        {renderExerciseVideo(exercise)}
                      </div>
                    )}

                    {/* Exercise notes */}
                    {isEditing ? (
                      <div className="ms-4">
                        <CFormInput
                          placeholder="Notes (Sets, Reps, Tempo, Rest etc.)"
                          value={exercise.notes || ''}
                          onChange={(e) => {
                            const updatedExercises = [...(editedWorkout.exercises || [])];
                            updatedExercises[index] = {
                              ...exercise,
                              notes: e.target.value
                            };
                            setEditedWorkout({
                              ...editedWorkout,
                              exercises: updatedExercises
                            });
                          }}
                          className="mb-2"
                        />
                      </div>
                    ) : exercise.notes && (
                      <div className="ms-4">
                        <small className="text-muted">{exercise.notes}</small>
                      </div>
                    )}
                  </CListGroupItem>
                ))}
              </CListGroup>

              {isEditing && (
                <div className="d-flex gap-2 mt-3">
                  <CButton 
                    color="primary" 
                    variant="outline" 
                    className="w-50 mx-auto"
                    onClick={handleAddExercise}
                  >
                    + Exercise
                  </CButton>
                </div>
              )}
            </div>

            <div className="mb-4">
              <h4>Cooldown</h4>
              {isEditing ? (
                <CFormTextarea
                  value={editedWorkout.cooldown || ''}
                  onChange={(e) => setEditedWorkout({
                    ...editedWorkout,
                    cooldown: e.target.value
                  })}
                />
              ) : (
                <p>{editedWorkout.cooldown}</p>
              )}
            </div>
          </>
        );

      case 'habit':
      case 'rest':
        return (
          <div className="mb-4">
            <h4>{workout.type === 'habit' ? 'Notes' : 'Rest Day Notes'}</h4>
            {isEditing ? (
              <CFormTextarea
                value={editedWorkout.description || ''}
                onChange={(e) => setEditedWorkout({
                  ...editedWorkout,
                  description: e.target.value
                })}
              />
            ) : (
              <p>{editedWorkout.description}</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <CRow className="mb-4">
        <CCol>
          <div className="d-flex gap-2">
            <CButton 
              color="primary" 
              variant="outline" 
              className="mb-3"
              onClick={() => navigate(-1)}
            >
              Back
            </CButton>
            <div className="ms-auto d-flex gap-2">
              {isEditing ? (
                <>
                  <CButton 
                    color="success" 
                    variant="outline" 
                    className="mb-3"
                    onClick={handleSave}
                  >
                    Save
                  </CButton>
                  <CButton 
                    color="danger" 
                    variant="outline" 
                    className="mb-3"
                    onClick={() => {
                      setIsEditing(false);
                      setEditedWorkout(workout);
                    }}
                  >
                    Cancel
                  </CButton>
                </>
              ) : (
                <CButton 
                  color="primary"
                  variant="outline" 
                  className="mb-3"
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </CButton>
              )}
              <CButton 
                color="danger" 
                variant="outline" 
                className="mb-3"
                onClick={() => setShowDeleteModal(true)}
              >
                Delete
              </CButton>
            </div>
          </div>
        </CCol>
      </CRow>
      <CCard>
        <CCardHeader>
          {isEditing ? (
            <CFormInput
              value={editedWorkout.title || ''}
              className="mb-2"
              placeholder="Workout Title"
              onChange={(e) => setEditedWorkout({
                ...editedWorkout,
                title: e.target.value
              })}
            />
          ) : (
            <h3>{editedWorkout.title || 'Untitled'}</h3>
          )}
          <div className="text-muted">
            {editedWorkout.type.charAt(0).toUpperCase() + editedWorkout.type.slice(1)}
          </div>
        </CCardHeader>
        <CCardBody>
          <div className="mb-4">
            <strong>Date:</strong>{' '}
            {new Date(workout.date).toLocaleDateString()}
          </div>

          {renderContent()}
        </CCardBody>
      </CCard>

      {/* Delete Confirmation Modal */}
      <CModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
      >
        <CModalHeader>
          <h5>Confirm Delete</h5>
        </CModalHeader>
        <CModalBody>
          Are you sure you want to delete this {workout.type}?
          This action cannot be undone.
        </CModalBody>
        <CModalFooter>
          <CButton 
            color="secondary" 
            onClick={() => setShowDeleteModal(false)}
          >
            Cancel
          </CButton>
          <CButton 
            color="danger" 
            onClick={handleDelete}
          >
            Delete
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  );
};

export default WorkoutDetailPage; 