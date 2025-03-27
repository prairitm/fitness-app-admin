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
} from '@coreui/react';

const WorkoutDetailPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { clientEmail } = useParams();
  const { workout } = location.state;
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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

  const renderContent = () => {
    switch (workout.type) {
      case 'workout':
        return (
          <>
            {workout.warmup && (
              <div className="mb-4">
                <h4>Warmup</h4>
                <p>{workout.warmup}</p>
              </div>
            )}

            {workout.exercises && workout.exercises.length > 0 && (
              <div className="mb-4">
                <h4>Exercises</h4>
                <CListGroup>
                  {workout.exercises.map((exercise, index) => (
                    <CListGroupItem key={exercise.id}>
                      <div className="d-flex align-items-center mb-2">
                        <h5 className="mb-0 me-2">{exercise.letter})</h5>
                        <strong>{exercise.title}</strong>
                      </div>
                      {exercise.metrics && exercise.metrics.length > 0 && (
                        <div className="ms-4">
                          <small className="text-muted">
                            Metrics: {exercise.metrics.join(', ')}
                          </small>
                        </div>
                      )}
                    </CListGroupItem>
                  ))}
                </CListGroup>
              </div>
            )}

            {workout.cooldown && (
              <div className="mb-4">
                <h4>Cooldown</h4>
                <p>{workout.cooldown}</p>
              </div>
            )}
          </>
        );

      case 'habit':
        return (
          <div className="mb-4">
            <h4>Notes</h4>
            <p>{workout.description}</p>
          </div>
        );

      case 'rest':
        return (
          <div className="mb-4">
            <h4>Rest Day Notes</h4>
            <p>{workout.description}</p>
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
            <CButton 
              color="danger" 
              variant="outline" 
              className="mb-3 ms-auto"
              onClick={() => setShowDeleteModal(true)}
            >
              Delete Workout
            </CButton>
          </div>
        </CCol>
      </CRow>
      <CCard>
        <CCardHeader>
          <h3>{workout.title || 'Untitled'}</h3>
          <div className="text-muted">
            {workout.type.charAt(0).toUpperCase() + workout.type.slice(1)}
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