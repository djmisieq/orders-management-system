import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { format, addHours } from 'date-fns';
import Select from 'react-select';
import axios from 'axios';

// Services
import { createProductionTask } from '../../services/productionTaskService';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const TaskCreateModal = ({ show, onHide, onTaskCreated, resources, currentUser }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orders, setOrders] = useState([]);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    orderId: '',
    title: '',
    description: '',
    taskType: 'Production',
    priority: 3,
    status: 'Planned',
    startTime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    endTime: format(addHours(new Date(), 2), "yyyy-MM-dd'T'HH:mm"),
    notes: ''
  });
  
  // Options for dropdown selects
  const taskTypeOptions = [
    { value: 'Preparation', label: 'Przygotowanie' },
    { value: 'Production', label: 'Produkcja' },
    { value: 'Assembly', label: 'Montaż' },
    { value: 'Testing', label: 'Testowanie' },
    { value: 'Packaging', label: 'Pakowanie' }
  ];
  
  const priorityOptions = [
    { value: 1, label: '1 - Bardzo niski' },
    { value: 2, label: '2 - Niski' },
    { value: 3, label: '3 - Średni' },
    { value: 4, label: '4 - Wysoki' },
    { value: 5, label: '5 - Bardzo wysoki' }
  ];
  
  const statusOptions = [
    { value: 'Planned', label: 'Planowane' },
    { value: 'InProgress', label: 'W realizacji' },
    { value: 'OnHold', label: 'Wstrzymane' }
  ];
  
  useEffect(() => {
    if (show) {
      fetchOrders();
      resetForm();
    }
  }, [show]);
  
  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/orders`);
      setOrders(response.data);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Nie udało się pobrać listy zamówień.');
    }
  };
  
  const resetForm = () => {
    setFormData({
      orderId: '',
      title: '',
      description: '',
      taskType: 'Production',
      priority: 3,
      status: 'Planned',
      startTime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      endTime: format(addHours(new Date(), 2), "yyyy-MM-dd'T'HH:mm"),
      notes: ''
    });
    setError(null);
    setSuccess(false);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSelectChange = (field) => (selectedOption) => {
    setFormData(prev => ({
      ...prev,
      [field]: selectedOption.value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      // Validate form
      if (!formData.orderId || !formData.title || !formData.startTime || !formData.endTime) {
        setError('Proszę wypełnić wszystkie wymagane pola.');
        setLoading(false);
        return;
      }
      
      // Prepare data for API
      const taskData = {
        orderId: parseInt(formData.orderId),
        title: formData.title,
        description: formData.description,
        taskType: formData.taskType,
        priority: formData.priority,
        status: formData.status,
        estimatedDuration: calculateDurationInMinutes(formData.startTime, formData.endTime),
        plannedStartTime: new Date(formData.startTime).toISOString(),
        plannedEndTime: new Date(formData.endTime).toISOString(),
        notes: formData.notes,
        createdById: currentUser.id,
        createdByName: currentUser.name,
        completionPercentage: 0
      };
      
      // Send to API
      await createProductionTask(taskData);
      
      setSuccess(true);
      setTimeout(() => {
        onTaskCreated && onTaskCreated();
      }, 1500);
      
    } catch (err) {
      console.error('Error creating task:', err);
      setError('Nie udało się utworzyć zadania. Spróbuj ponownie później.');
    } finally {
      setLoading(false);
    }
  };
  
  // Helper to calculate duration in minutes between two datetime strings
  const calculateDurationInMinutes = (startTimeStr, endTimeStr) => {
    const startTime = new Date(startTimeStr);
    const endTime = new Date(endTimeStr);
    return Math.round((endTime - startTime) / (1000 * 60));
  };
  
  return (
    <Modal show={show} onHide={onHide} size="lg" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Dodaj nowe zadanie produkcyjne</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">Zadanie zostało utworzone pomyślnie!</Alert>}
          
          <Row>
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label>Zamówienie</Form.Label>
                <Form.Select
                  name="orderId"
                  value={formData.orderId}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Wybierz zamówienie...</option>
                  {orders.map(order => (
                    <option key={order.id} value={order.id}>
                      {order.customerName} (ID: {order.id})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          
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
                <Form.Label>Typ zadania</Form.Label>
                <Select
                  options={taskTypeOptions}
                  value={taskTypeOptions.find(option => option.value === formData.taskType)}
                  onChange={handleSelectChange('taskType')}
                  isSearchable={false}
                />
              </Form.Group>
            </Col>
          </Row>
          
          <Row>
            <Col md={12}>
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
          </Row>
          
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Priorytet</Form.Label>
                <Select
                  options={priorityOptions}
                  value={priorityOptions.find(option => option.value === formData.priority)}
                  onChange={handleSelectChange('priority')}
                  isSearchable={false}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Select
                  options={statusOptions}
                  value={statusOptions.find(option => option.value === formData.status)}
                  onChange={handleSelectChange('status')}
                  isSearchable={false}
                />
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
                  value={formData.startTime}
                  onChange={handleInputChange}
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
                  value={formData.endTime}
                  onChange={handleInputChange}
                  required
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
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={loading}>
            Anuluj
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Tworzenie...
              </>
            ) : (
              'Utwórz zadanie'
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default TaskCreateModal;