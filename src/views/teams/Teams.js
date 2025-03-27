import React, { useState } from 'react';
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

const Teams = () => {
  const [coaches, setCoaches] = useState(() => {
    const savedCoaches = localStorage.getItem('coaches');
    return savedCoaches ? JSON.parse(savedCoaches) : [];
  });
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

  // Handle coach addition
  const handleAddCoach = (e) => {
    e.preventDefault();
    if (newCoach.name && newCoach.email) {
      const updatedCoaches = [...coaches, { ...newCoach, clients: [] }];
      setCoaches(updatedCoaches);
      localStorage.setItem('coaches', JSON.stringify(updatedCoaches));
      setNewCoach({ name: '', email: '', clients: [] });
      setShowCoachModal(false);
    }
  };

  // Handle client addition
  const handleAddClient = (e) => {
    e.preventDefault();
    if (newClient.name && newClient.email && selectedCoach !== null) {
      const updatedCoaches = [...coaches];
      updatedCoaches[selectedCoach].clients.push(newClient);
      setCoaches(updatedCoaches);
      localStorage.setItem('coaches', JSON.stringify(updatedCoaches));
      setNewClient({ name: '', email: '' });
      setSelectedCoach(null);
      setShowClientModal(false);
    }
  };

  const handleDeleteCoach = (coachIndex) => {
    const updatedCoaches = coaches.filter((_, index) => index !== coachIndex);
    setCoaches(updatedCoaches);
    localStorage.setItem('coaches', JSON.stringify(updatedCoaches));
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
    localStorage.setItem('coaches', JSON.stringify(updatedCoaches));
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
      localStorage.setItem('coaches', JSON.stringify(updatedCoaches));
      
      // Reset and close modal
      setTransferModalVisible(false);
      setClientToTransfer(null);
      setSelectedNewCoach(null);
    } catch (error) {
      console.error('Error during transfer:', error);
    }
  };

  return (
    <>
      <CRow className="mb-4 align-items-center">
        <CCol>
          <h2>Teams</h2>
        </CCol>
        <CCol xs="auto">
          <CButton 
            color="primary" 
            className="me-2"
            onClick={() => setShowCoachModal(true)}
          >
            <CIcon icon={cilPlus} className="me-2" /> Add Coach
          </CButton>
          <CButton 
            color="secondary"
            onClick={() => setShowClientModal(true)}
          >
            <CIcon icon={cilPlus} className="me-2" /> Add Client
          </CButton>
        </CCol>
      </CRow>

      <CRow>
        {/* Coaches Table */}
        <CCol md={5}>
          <CCard>
            <CCardHeader>
              <h4 className="mb-0">Coaches</h4>
            </CCardHeader>
            <CCardBody>
              <CTable hover responsive align="middle">
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Name</CTableHeaderCell>
                    <CTableHeaderCell>Email</CTableHeaderCell>
                    <CTableHeaderCell>Clients</CTableHeaderCell>
                    <CTableHeaderCell></CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {coaches.map((coach, index) => (
                    <CTableRow 
                      key={index}
                      active={selectedCoach === index}
                      onClick={() => setSelectedCoach(index)}
                      style={{ cursor: 'pointer' }}
                    >
                      <CTableDataCell>
                        <div className="d-flex align-items-center">
                          <CAvatar color="primary" className="me-3">
                            {coach.name[0]}
                          </CAvatar>
                          {coach.name}
                        </div>
                      </CTableDataCell>
                      <CTableDataCell>{coach.email}</CTableDataCell>
                      <CTableDataCell>
                        <CBadge color="info">{coach.clients.length}</CBadge>
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
            </CCardBody>
          </CCard>
        </CCol>

        {/* Clients Table */}
        <CCol md={7}>
          <CCard>
            <CCardHeader>
              <div className="d-flex justify-content-between align-items-center">
                <h4 className="mb-0">
                  {selectedCoach !== null 
                    ? `${coaches[selectedCoach]?.name}'s Clients` 
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
            <CCardBody>
              <CTable hover responsive align="middle">
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Name</CTableHeaderCell>
                    <CTableHeaderCell>Email</CTableHeaderCell>
                    <CTableHeaderCell>Status</CTableHeaderCell>
                    <CTableHeaderCell>Compliance</CTableHeaderCell>
                    <CTableHeaderCell></CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {(selectedCoach !== null ? coaches[selectedCoach]?.clients : 
                    coaches.flatMap(coach => coach.clients))
                    .filter(client => client.name.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((client, index) => (
                      <CTableRow 
                        key={index}
                        onClick={() => navigate(`/client/${client.email}`)}
                        style={{ cursor: 'pointer' }}
                      >
                        <CTableDataCell>
                          <div className="d-flex align-items-center">
                            <CAvatar color="secondary" className="me-3">
                              {client.name[0]}
                            </CAvatar>
                            {client.name}
                          </div>
                        </CTableDataCell>
                        <CTableDataCell>{client.email}</CTableDataCell>
                        <CTableDataCell>
                          <CBadge color="success">Active</CBadge>
                        </CTableDataCell>
                        <CTableDataCell>
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
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Add Coach Modal */}
      <CModal
        visible={showCoachModal}
        onClose={() => setShowCoachModal(false)}
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
            >
              Cancel
            </CButton>
            <CButton 
              color="primary" 
              type="submit"
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
                    {coach.name}
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
            >
              Cancel
            </CButton>
            <CButton 
              color="primary" 
              type="submit"
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
      >
        <CModalHeader closeButton>
          <CModalTitle>Transfer Client to Another Coach</CModalTitle>
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
                    {coach.name}
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
          >
            Transfer
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  );
};

export default Teams;
