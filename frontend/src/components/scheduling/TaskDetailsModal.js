import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Spinner, Alert, Badge, ProgressBar, ListGroup, Tab, Tabs } from 'react-bootstrap';
import { format } from 'date-fns';
import Select from 'react-select';

// Services
import { getProductionTaskById, updateProductionTask, assignResource, unassignResource, deleteProductionTask } from '../../services/productionTaskService';

const TaskDetailsModal = ({ show, onHide, taskId, onTaskUpdated, resources, currentUser }) => {
  const [task, setTask] = useState(null);
  const [resourceAssignments, setResourceAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: '',
    priority: 3,
    completionPercentage: 0,
    notes: ''
  });
  const [assignmentForm, setAssignmentForm] = useState({
    resourceId: '',
    startTime: '',
    endTime: '',
    allocationPercentage: 100,
    notes: ''
  });
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const statusOptions = [
    { value: 'Planned', label: 'Planowane' },
    { value: 'InProgress', label: 'W realizacji' },
    { value: 'Completed', label: 'Zakończone' },
    { value: 'OnHold', label: 'Wstrzymane' },
    { value: 'Cancelled', label: 'Anulowane' }
  ];
  
  const priorityOptions = [
    { value: 1, label: '1 - Bardzo niski' },
    { value: 2, label: '2 - Niski' },
    { value: 3, label: '3 - Średni' },
    { value: 4, label: '4 - Wysoki' },
    { value: 5, label: '5 - Bardzo wysoki' }
  ];
  
  useEffect(() => {
    if (show && taskId) {
      loadTaskDetails();
    }
  }, [show, taskId]);
  
  const loadTaskDetails = async () => {
    if (!taskId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await getProductionTaskById(taskId);
      
      setTask(data.task);
      setResourceAssignments(data.resourceAssignments || []);
      
      // Set form data
      setFormData({
        title: data.task.title,
        description: data.task.description || '',
        status: data.task.status,
        priority: data.task.priority,
        completionPercentage: data.task.completionPercentage,
        notes: data.task.notes || ''
      });
      
      // Reset assignment form
      const now = new Date();
      setAssignmentForm({
        resourceId: '',
        startTime: format(now, "yyyy-MM-dd'T'HH:mm"),
        endTime: format(new Date(now.getTime() + 2 * 60 * 60 * 1000), "yyyy-MM-dd'T'HH:mm"),
        allocationPercentage: 100,
        notes: ''
      });
      
    } catch (err) {
      setError('Nie udało się załadować szczegółów zadania. Spróbuj ponownie później.');
      console.error('Error loading task details:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleAssignmentChange = (e) => {
    const { name, value } = e.target;
    setAssignmentForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleStatusChange = (selectedOption) => {
    setFormData(prev => ({
      ...prev,
      status: selectedOption.value
    }));
  };
  
  const handlePriorityChange = (selectedOption) => {
    setFormData(prev => ({
      ...prev,
      priority: selectedOption.value
    }));
  };
  
  const handleUpdateTask = async () => {
    setLoading(true);
    setError(null);
    setUpdateSuccess(false);
    
    try {
      // Prepare task data
      const updatedTask = {
        ...task,
        title: formData.title,
        description: formData.description,
        status: formData.status,
        priority: formData.priority,
        completionPercentage: parseInt(formData.completionPercentage),
        notes: formData.notes,
        updatedAt: new Date().toISOString(),
        updatedById: currentUser.id,
        updatedByName: currentUser.name
      };
      
      await updateProductionTask(taskId, updatedTask);
      
      setUpdateSuccess(true);
      setTimeout(() => {
        onTaskUpdated && onTaskUpdated();
      }, 1500);
      
    } catch (err) {
      setError('Nie udało się zaktualizować zadania. Spróbuj ponownie później.');
      console.error('Error updating task:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAssignResource = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const assignmentData = {
        taskId: taskId,
        resourceId: parseInt(assignmentForm.resourceId),
        startTime: new Date(assignmentForm.startTime),
        endTime: new Date(assignmentForm.endTime),
        allocationPercentage: parseInt(assignmentForm.allocationPercentage),
        notes: assignmentForm.notes,
        userId: currentUser.id,
        userName: currentUser.name
      };
      
      await assignResource(assignmentData);
      
      // Reload task details
      await loadTaskDetails();
      
    } catch (err) {
      setError('Nie udało się przypisać zasobu do zadania. Spróbuj ponownie później.');
      console.error('Error assigning resource:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleUnassignResource = async (resourceId) => {
    setLoading(true);
    setError(null);
    
    try {
      await unassignResource(taskId, resourceId);
      
      // Reload task details
      await loadTaskDetails();
      
    } catch (err) {
      setError('Nie udało się usunąć przypisania zasobu. Spróbuj ponownie później.');
      console.error('Error unassigning resource:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteTask = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await deleteProductionTask(taskId);
      
      onHide();
      onTaskUpdated && onTaskUpdated();
      
    } catch (err) {
      setError('Nie udało się usunąć zadania. Spróbuj ponownie później.');
      console.error('Error deleting task:', err);
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };
  
  // Filter out resources that are already assigned
  const availableResources = resources.filter(resource => 
    !resourceAssignments.some(assignment => assignment.resourceId === resource.id)
  );
  
  // Get status badge color
  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'Planned': return 'primary';
      case 'InProgress': return 'warning';
      case 'Completed': return 'success';
      case 'OnHold': return 'secondary';
      case 'Cancelled': return 'danger';
      default: return 'primary';
    }
  };
  
  return (
    <Modal show={show} onHide={onHide} size="lg" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>
          {loading && !task ? 'Ładowanie zadania...' : `Zadanie: ${task?.title || ''}`}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading && !task ? (
          <div className="text-center py-4">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Ładowanie...</span>
            </Spinner>
          </div>
        ) : error ? (
          <Alert variant="danger">{error}</Alert>
        ) : updateSuccess ? (
          <Alert variant="success">Zadanie zostało zaktualizowane pomyślnie!</Alert>
        ) : task ? (
          <Tabs defaultActiveKey="details" className="mb-3">
            <Tab eventKey="details" title="Szczegóły">
              <Form>
                <Row>
                  <Col md={8}>
                    <Form.Group className="mb-3">
                      <Form.Label>Tytuł zadania</Form.Label>
                      <Form.Control
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Status</Form.Label>
                      <Select
                        options={statusOptions}
                        value={statusOptions.find(option => option.value === formData.status)}
                        onChange={handleStatusChange}
                        isSearchable={false}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Row>
                  <Col md={8}>
                    <Form.Group className="mb-3">
                      <Form.Label>Opis</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Priorytet</Form.Label>
                      <Select
                        options={priorityOptions}
                        value={priorityOptions.find(option => option.value === formData.priority)}
                        onChange={handlePriorityChange}
                        isSearchable={false}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>Postęp realizacji ({formData.completionPercentage}%)</Form.Label>
                      <Form.Control
                        type="range"
                        name="completionPercentage"
                        min="0"
                        max="100"
                        step="5"
                        value={formData.completionPercentage}
                        onChange={handleInputChange}
                      />
                      <ProgressBar 
                        now={formData.completionPercentage} 
                        label={`${formData.completionPercentage}%`}
                        variant={formData.completionPercentage === 100 ? "success" : "primary"}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>Notatki</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Row>
                  <Col md={6}>
                    <p className="mb-1">
                      <strong>Zamówienie:</strong> {task.order?.customerName || 'N/A'}
                    </p>
                    <p className="mb-1">
                      <strong>Nr zamówienia:</strong> {task.orderId}
                    </p>
                  </Col>
                  <Col md={6}>
                    <p className="mb-1">
                      <strong>Planowany start:</strong> {format(new Date(task.plannedStartTime), 'dd.MM.yyyy HH:mm')}
                    </p>
                    <p className="mb-1">
                      <strong>Planowany koniec:</strong> {format(new Date(task.plannedEndTime), 'dd.MM.yyyy HH:mm')}
                    </p>
                  </Col>
                </Row>
              </Form>
            </Tab>
            
            <Tab eventKey="resources" title="Zasoby">
              <div className="mb-4">
                <h5>Przypisane zasoby</h5>
                {resourceAssignments.length === 0 ? (
                  <p className="text-muted">Brak przypisanych zasobów dla tego zadania.</p>
                ) : (
                  <ListGroup>
                    {resourceAssignments.map(assignment => {
                      const resource = resources.find(r => r.id === assignment.resourceId);
                      return (
                        <ListGroup.Item key={`${assignment.taskId}-${assignment.resourceId}`} className="d-flex justify-content-between align-items-center">
                          <div>
                            <div><strong>{resource?.name || `Zasób #${assignment.resourceId}`}</strong></div>
                            <div className="text-muted small">
                              {format(new Date(assignment.startTime), 'dd.MM.yyyy HH:mm')} - {format(new Date(assignment.endTime), 'dd.MM.yyyy HH:mm')}
                            </div>
                            <div className="text-muted small">
                              Alokacja: {assignment.allocationPercentage}%
                            </div>
                            {assignment.notes && (
                              <div className="text-muted small">
                                Uwagi: {assignment.notes}
                              </div>
                            )}
                          </div>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => handleUnassignResource(assignment.resourceId)}
                            disabled={loading}
                          >
                            Usuń
                          </Button>
                        </ListGroup.Item>
                      );
                    })}
                  </ListGroup>
                )}
              </div>
              
              <div className="mt-4">
                <h5>Przypisz nowy zasób</h5>
                <Form>
                  <Row>
                    <Col md={12}>
                      <Form.Group className="mb-3">
                        <Form.Label>Wybierz zasób</Form.Label>
                        <Form.Select
                          name="resourceId"
                          value={assignmentForm.resourceId}
                          onChange={handleAssignmentChange}
                          required
                        >
                          <option value="">Wybierz zasób...</option>
                          {availableResources.map(resource => (
                            <option key={resource.id} value={resource.id}>
                              {resource.name} ({resource.resourceType})
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>
                  
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Data rozpoczęcia</Form.Label>
                        <Form.Control
                          type="datetime-local"
                          name="startTime"
                          value={assignmentForm.startTime}
                          onChange={handleAssignmentChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Data zakończenia</Form.Label>
                        <Form.Control
                          type="datetime-local"
                          name="endTime"
                          value={assignmentForm.endTime}
                          onChange={handleAssignmentChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Alokacja (%)</Form.Label>
                        <Form.Control
                          type="number"
                          name="allocationPercentage"
                          value={assignmentForm.allocationPercentage}
                          onChange={handleAssignmentChange}
                          min="1"
                          max="100"
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Notatki</Form.Label>
                        <Form.Control
                          type="text"
                          name="notes"
                          value={assignmentForm.notes}
                          onChange={handleAssignmentChange}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  
                  <Button 
                    variant="primary" 
                    onClick={handleAssignResource} 
                    disabled={loading || !assignmentForm.resourceId}
                  >
                    {loading ? 'Przypisywanie...' : 'Przypisz zasób'}
                  </Button>
                </Form>
              </div>
            </Tab>
          </Tabs>
        ) : (
          <Alert variant="warning">Nie znaleziono zadania.</Alert>
        )}
        
        {showDeleteConfirm && (
          <div className="mt-3 p-3 border border-danger rounded">
            <p className="text-danger"><strong>Czy na pewno chcesz usunąć to zadanie?</strong></p>
            <p>Ta operacja jest nieodwracalna.</p>
            <div className="d-flex justify-content-end">
              <Button 
                variant="outline-secondary" 
                size="sm"
                onClick={() => setShowDeleteConfirm(false)}
                className="me-2"
                disabled={loading}
              >
                Anuluj
              </Button>
              <Button 
                variant="danger" 
                size="sm"
                onClick={handleDeleteTask}
                disabled={loading}
              >
                {loading ? 'Usuwanie...' : 'Tak, usuń zadanie'}
              </Button>
            </div>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        {!showDeleteConfirm && task && (
          <Button 
            variant="outline-danger" 
            onClick={() => setShowDeleteConfirm(true)}
            className="me-auto"
            disabled={loading}
          >
            Usuń zadanie
          </Button>
        )}
        <Button 
          variant="secondary" 
          onClick={onHide}
          disabled={loading}
        >
          Zamknij
        </Button>
        {task && (
          <Button 
            variant="primary" 
            onClick={handleUpdateTask}
            disabled={loading}
          >
            {loading ? 'Aktualizowanie...' : 'Zapisz zmiany'}
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default TaskDetailsModal;