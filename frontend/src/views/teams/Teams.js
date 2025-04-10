import React, { useState, useEffect } from 'react';
import {
  CCard,
  CCardHeader,
  CCardBody,
  CButton,
  CRow,
  CCol,
  CTable,
  CTableHead,
  CTableBody,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
  CInputGroup,
  CFormInput,
  CBadge,
  CAvatar,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CFormLabel,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
  CFormSelect,
  CAlert,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilPlus, cilOptions } from '@coreui/icons';
import { useNavigate } from 'react-router-dom';
import { teamService } from '../../services/api';

const Teams = () => {
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newCoach, setNewCoach] = useState({ name: '', email: '', clients: [] });
  const [newClient, setNewClient] = useState({ name: '', email: '' });
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'archived'
  const [searchQuery, setSearchQuery] = useState('');
  const [showCoachModal, setShowCoachModal] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const [transferModalVisible, setTransferModalVisible] = useState(false);
  const [clientToTransfer, setClientToTransfer] = useState(null);
  const [selectedNewCoach, setSelectedNewCoach] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCoaches();
  }, []);

  const fetchCoaches = async () => {
    try {
      setLoading(true);
      const response = await teamService.getCoaches();
      console.log('Fetched coaches:', response.data);
      // The backend already filters coaches by adminId, so we don't need additional filtering
      setCoaches(response.data);
    } catch (err) {
      setError('Failed to fetch coaches');
      console.error('Error fetching coaches:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCoach = async (e) => {
    e.preventDefault();
    try {
      await teamService.addCoach(newCoach);
      await fetchCoaches();
      setNewCoach({ name: '', email: '', clients: [] });
      setShowCoachModal(false);
    } catch (err) {
      setError('Failed to add coach');
      console.error(err);
    }
  };

  const handleAddClient = async (e) => {
    e.preventDefault();
    try {
      const selectedCoachData = coaches[selectedCoach];
      if (!selectedCoachData) {
        setError('Please select a coach first');
        return;
      }
      await teamService.addClient(selectedCoachData._id, newClient);
      await fetchCoaches(); // Fetch updated coaches list
      setNewClient({ name: '', email: '' });
      setShowClientModal(false);
      setSelectedCoach(null);
    } catch (err) {
      setError('Failed to add client');
      console.error(err);
    }
  };

  const handleDeleteCoach = (coachIndex) => {
    const updatedCoaches = coaches.filter((_, index) => index !== coachIndex);
    setCoaches(updatedCoaches);
    if (selectedCoach === coachIndex) {
      setSelectedCoach(null);
    }
  }

  const handleDeleteClient = (clientIndex, coachIndex) => {
    // Check if a coach is selected
    if (selectedCoach === null) {
      alert('To delete a client, please select the coach');
      return;
    }

    // Create a deep copy of the coaches array
    const updatedCoaches = JSON.parse(JSON.stringify(coaches));
    
    // Use provided coachIndex or selectedCoach
    const targetCoachIndex = coachIndex !== undefined ? coachIndex : selectedCoach;
    
    // Remove the client at the specified index
    updatedCoaches[targetCoachIndex].clients = updatedCoaches[targetCoachIndex].clients.filter(
      (_, index) => index !== clientIndex
    );

    // Update state and localStorage
    setCoaches(updatedCoaches);
  }

  const handleTransferClient = () => {
    if (selectedCoach === null || clientToTransfer === null || selectedNewCoach === null) {
      console.log('Missing required data:', { selectedCoach, clientToTransfer, selectedNewCoach });
      return;
    }
    
    try {
      // Create deep copies of the coaches array
      const updatedCoaches = JSON.parse(JSON.stringify(coaches));
      
      // Get the client to transfer
      const clientBeingTransferred = updatedCoaches[selectedCoach].clients[clientToTransfer];
      console.log('Client being transferred:', clientBeingTransferred);
      
      // Remove client from current coach
      updatedCoaches[selectedCoach].clients = updatedCoaches[selectedCoach].clients.filter(
        (_, index) => index !== clientToTransfer
      );
      
      // Initialize clients array if it doesn't exist
      if (!updatedCoaches[selectedNewCoach].clients) {
        updatedCoaches[selectedNewCoach].clients = [];
      }
      
      // Add client to new coach
      updatedCoaches[selectedNewCoach].clients.push(clientBeingTransferred);
      
      console.log('Updated coaches after transfer:', updatedCoaches);
      
      // Update state and localStorage
      setCoaches(updatedCoaches);
    } catch (error) {
      console.error('Error during transfer:', error);
    }
  };

  const filteredCoaches = React.useMemo(() => {
    if (!coaches || !Array.isArray(coaches)) return [];
    if (!searchQuery) return coaches;

    return coaches.filter(coach => {
      try {
        // Get coach name and email safely
        const firstName = coach?.userId?.firstName || '';
        const lastName = coach?.userId?.lastName || '';
        const email = coach?.userId?.email || '';
        const searchLower = searchQuery.toLowerCase();

        // Check if any of the fields match
        return firstName.toLowerCase().includes(searchLower) ||
               lastName.toLowerCase().includes(searchLower) ||
               email.toLowerCase().includes(searchLower);
      } catch (error) {
        console.error('Error filtering coach:', error);
        return false;
      }
    });
  }, [coaches, searchQuery]);

  return (
    <>
      <CRow className="mb-4 align-items-center">
        <CCol xs={12} sm={6}>
          <h2>Teams</h2>
        </CCol>
        <CCol xs={12} sm={6} className="d-flex justify-content-sm-end mt-3 mt-sm-0">
          <CButton 
            color="primary" 
            className="me-2 w-100 w-sm-auto"
            onClick={() => setShowCoachModal(true)}
          >
            <CIcon icon={cilPlus} className="me-2" /> Add Coach
          </CButton>
          <CButton 
            color="secondary"
            className="w-100 w-sm-auto"
            onClick={() => setShowClientModal(true)}
          >
            <CIcon icon={cilPlus} className="me-2" /> Add Client
          </CButton>
        </CCol>
      </CRow>

      <CRow>
        <CCol xs={12}>
          {error && (
            <CAlert color="danger" dismissible onClose={() => setError(null)}>
              {error}
            </CAlert>
          )}
          <CCard>
            <CCardHeader>
              <h4 className="mb-0">Coaches</h4>
            </CCardHeader>
            <CCardBody className="p-0">
              {loading ? (
                <div className="text-center p-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : error ? (
                <div className="text-center p-4">
                  <CAlert color="danger">{error}</CAlert>
                </div>
              ) : coaches.length === 0 ? (
                <div className="text-center p-4">
                  <p>No coaches found. Add a coach to get started.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <CTable hover align="middle">
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell>Name</CTableHeaderCell>
                        <CTableHeaderCell className="d-none d-md-table-cell">Email</CTableHeaderCell>
                        <CTableHeaderCell>Clients</CTableHeaderCell>
                        <CTableHeaderCell></CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {filteredCoaches.map((coach, index) => (
                        <CTableRow 
                          key={index}
                          active={selectedCoach === index}
                          onClick={() => setSelectedCoach(index)}
                          style={{ cursor: 'pointer' }}
                        >
                          <CTableDataCell>
                            <div className="d-flex align-items-center">
                              <CAvatar color="primary" className="me-2">
                                {(coach.name || (coach.userId?.firstName + ' ' + coach.userId?.lastName))[0]}
                              </CAvatar>
                              <span className="text-truncate">{coach.name || (coach.userId?.firstName + ' ' + coach.userId?.lastName) || 'N/A'}</span>
                            </div>
                          </CTableDataCell>
                          <CTableDataCell className="d-none d-md-table-cell text-truncate">{coach.email || coach.userId?.email || 'N/A'}</CTableDataCell>
                          <CTableDataCell>
                            <CBadge color="info">{coach.clients?.length || 'N/A'}</CBadge>
                          </CTableDataCell>
                          <CTableDataCell>
                            <CDropdown alignment="end">
                              <CDropdownToggle color="link" caret={false}>
                                <CIcon icon={cilOptions} />
                              </CDropdownToggle>
                              <CDropdownMenu>
                                <CDropdownItem 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteCoach(index);
                                  }}
                                >
                                  Delete
                                </CDropdownItem>
                              </CDropdownMenu>
                            </CDropdown>
                          </CTableDataCell>
                        </CTableRow>
                      ))}
                    </CTableBody>
                  </CTable>
                </div>
              )}
            </CCardBody>
          </CCard>
        </CCol>

        {/* Clients Table */}
        <CCol xs={12}>
          <CCard>
            <CCardHeader>
              <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
                <h4 className="mb-0">
                  {selectedCoach !== null 
                    ? `${coaches[selectedCoach]?.userId?.firstName} ${coaches[selectedCoach]?.userId?.lastName}` 
                    : 'All Clients'}
                </h4>
                <CInputGroup style={{ width: 'auto' }}>
                  <CFormInput
                    placeholder="Search clients"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </CInputGroup>
              </div>
            </CCardHeader>
            <CCardBody className="p-0">
              <div className="table-responsive">
                <CTable hover align="middle">
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>Name</CTableHeaderCell>
                      <CTableHeaderCell className="d-none d-md-table-cell">Email</CTableHeaderCell>
                      <CTableHeaderCell>Status</CTableHeaderCell>
                      <CTableHeaderCell className="d-none d-sm-table-cell">Compliance</CTableHeaderCell>
                      <CTableHeaderCell></CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {(selectedCoach !== null ? coaches[selectedCoach]?.clients : 
                      coaches.flatMap(coach => coach.clients))
                      .filter(client => {
                        if (!client || !searchQuery) return true;
                        try {
                          const clientName = client.name || '';
                          const clientEmail = client.email || '';
                          const searchLower = searchQuery.toLowerCase();
                          
                          return (clientName && clientName.toLowerCase().includes(searchLower)) ||
                                 (clientEmail && clientEmail.toLowerCase().includes(searchLower));
                        } catch (error) {
                          console.error('Error filtering client:', error);
                          return false;
                        }
                      })
                      .map((client, index) => (
                        <CTableRow 
                          key={index}
                          onClick={() => navigate(`/client/${client.email}`)}
                          style={{ cursor: 'pointer' }}
                        >
                          <CTableDataCell>
                            <div className="d-flex align-items-center">
                              <CAvatar color="secondary" className="me-2">
                                {(client.name || '')[0] || '?'}
                              </CAvatar>
                              <span className="text-truncate">
                                {client.name || 'N/A'}
                              </span>
                            </div>
                          </CTableDataCell>
                          <CTableDataCell className="d-none d-md-table-cell text-truncate">
                            {client.email || 'N/A'}
                          </CTableDataCell>
                          <CTableDataCell>
                            <CBadge color="success">Active</CBadge>
                          </CTableDataCell>
                          <CTableDataCell className="d-none d-sm-table-cell">
                            <CBadge color="info">95%</CBadge>
                          </CTableDataCell>
                          <CTableDataCell onClick={(e) => e.stopPropagation()}>
                            {selectedCoach !== null && (
                              <CDropdown alignment="end">
                                <CDropdownToggle color="link" caret={false}>
                                  <CIcon icon={cilOptions} />
                                </CDropdownToggle>
                                <CDropdownMenu>
                                  <CDropdownItem 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteClient(index);
                                    }}
                                  >
                                    Delete
                                  </CDropdownItem>
                                  <CDropdownItem 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setClientToTransfer(index);
                                      setTransferModalVisible(true);
                                    }}
                                  >
                                    Transfer
                                  </CDropdownItem>
                                </CDropdownMenu>
                              </CDropdown>
                            )}
                          </CTableDataCell>
                        </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Add Coach Modal */}
      <CModal
        visible={showCoachModal}
        onClose={() => setShowCoachModal(false)}
        size="sm"
      >
        <CForm onSubmit={handleAddCoach}>
          <CModalHeader>
            <CModalTitle>Add New Coach</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <div className="mb-3">
              <CFormLabel htmlFor="coachName">Name</CFormLabel>
              <CFormInput
                id="coachName"
                placeholder="Enter coach name"
                value={newCoach.name}
                onChange={(e) => setNewCoach({ ...newCoach, name: e.target.value })}
                required
              />
            </div>
            <div className="mb-3">
              <CFormLabel htmlFor="coachEmail">Email</CFormLabel>
              <CFormInput
                type="email"
                id="coachEmail"
                placeholder="Enter coach email"
                value={newCoach.email}
                onChange={(e) => setNewCoach({ ...newCoach, email: e.target.value })}
                required
              />
            </div>
          </CModalBody>
          <CModalFooter>
            <CButton 
              color="secondary" 
              onClick={() => setShowCoachModal(false)}
              className="w-100 w-sm-auto"
            >
              Cancel
            </CButton>
            <CButton 
              color="primary" 
              type="submit"
              className="w-100 w-sm-auto"
            >
              Add Coach
            </CButton>
          </CModalFooter>
        </CForm>
      </CModal>

      {/* Add Client Modal */}
      <CModal
        visible={showClientModal}
        onClose={() => setShowClientModal(false)}
        size="sm"
      >
        <CForm onSubmit={handleAddClient}>
          <CModalHeader>
            <CModalTitle>Add New Client</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <div className="mb-3">
              <CFormLabel htmlFor="clientName">Name</CFormLabel>
              <CFormInput
                id="clientName"
                placeholder="Enter client name"
                value={newClient.name}
                onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                required
              />
            </div>
            <div className="mb-3">
              <CFormLabel htmlFor="clientEmail">Email</CFormLabel>
              <CFormInput
                type="email"
                id="clientEmail"
                placeholder="Enter client email"
                value={newClient.email}
                onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                required
              />
            </div>
            <div className="mb-3">
              <CFormLabel htmlFor="coachSelect">Assign Coach</CFormLabel>
              <CFormSelect
                id="coachSelect"
                value={selectedCoach === null ? '' : selectedCoach}
                onChange={(e) => setSelectedCoach(e.target.value === '' ? null : parseInt(e.target.value))}
                required
              >
                <option value="">Choose a coach...</option>
                {coaches.map((coach, index) => (
                  <option key={index} value={index}>
                    {coach.userId?.firstName} {coach.userId?.lastName}
                  </option>
                ))}
              </CFormSelect>
            </div>
          </CModalBody>
          <CModalFooter>
            <CButton 
              color="secondary" 
              onClick={() => {
                setShowClientModal(false);
                setNewClient({ name: '', email: '' });
                setSelectedCoach(null);
              }}
              className="w-100 w-sm-auto"
            >
              Cancel
            </CButton>
            <CButton 
              color="primary" 
              type="submit"
              className="w-100 w-sm-auto"
            >
              Add Client
            </CButton>
          </CModalFooter>
        </CForm>
      </CModal>

      {/* Transfer Modal */}
      <CModal 
        visible={transferModalVisible} 
        onClose={() => {
          setTransferModalVisible(false);
          setClientToTransfer(null);
          setSelectedNewCoach(null);
        }}
        size="sm"
      >
        <CModalHeader closeButton>
          <CModalTitle>Transfer Client</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CFormLabel>Select Coach</CFormLabel>
            <CFormSelect 
              className="mb-3"
              value={selectedNewCoach || ''}
              onChange={(e) => {
                const value = e.target.value ? Number(e.target.value) : null;
                console.log('Selected new coach:', value);
                setSelectedNewCoach(value);
              }}
            >
              <option value="">Choose a coach...</option>
              {coaches.map((coach, index) => (
                index !== selectedCoach && (
                  <option key={index} value={index}>
                    {coach.name || 'N/A'}
                  </option>
                )
              ))}
            </CFormSelect>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton 
            color="secondary" 
            onClick={() => {
              setTransferModalVisible(false);
              setClientToTransfer(null);
              setSelectedNewCoach(null);
            }}
            className="w-100 w-sm-auto"
          >
            Cancel
          </CButton>
          <CButton 
            color="primary" 
            onClick={() => {
              console.log('Transfer button clicked');
              handleTransferClient();
            }}
            disabled={selectedNewCoach === null}
            className="w-100 w-sm-auto"
          >
            Transfer
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  );
};

export default Teams;
