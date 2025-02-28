import React, { useState } from 'react';
import { Table, Button, Form, Row, Col, Card, Badge, Alert, Spinner, Modal } from 'react-bootstrap';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';

// Services
import { createResource, updateResource, deleteResource } from '../../services/resourceService';

const ResourcesPanel = ({ resources, onResourcesChange }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Form data for add/edit
  const [formData, setFormData] = useState({
    name: '',
    resourceType: 'Machine',
    department: '',
    capacity: '',
    costPerHour: '',
    capabilities: '',
    workingHours: '',
    daysOff: '',
    notes: '',
    isActive: true
  });
  
  // Available resource types and departments
  const resourceTypes = ['Machine', 'Person', 'Tool', 'Line'];
  const departments = ['Produkcja', 'Montaż', 'Pakowanie', 'Magazyn', 'Kontrola jakości'];
  
  // Reset form data
  const resetForm = () => {
    setFormData({
      name: '',
      resourceType: 'Machine',
      department: '',
      capacity: '',
      costPerHour: '',
      capabilities: '',
      workingHours: '',
      daysOff: '',
      notes: '',
      isActive: true
    });
    setError(null);
    setSuccess(null);
  };
  
  // Handle input change for form fields
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Open add resource modal
  const handleAddResource = () => {
    resetForm();
    setShowAddModal(true);
  };
  
  // Open edit resource modal
  const handleEditResource = (resource) => {
    setSelectedResource(resource);
    setFormData({
      name: resource.name,
      resourceType: resource.resourceType,
      department: resource.department || '',
      capacity: resource.capacity || '',
      costPerHour: resource.costPerHour || '',
      capabilities: resource.capabilities || '',
      workingHours: resource.workingHours || '',
      daysOff: resource.daysOff || '',
      notes: resource.notes || '',
      isActive: resource.isActive
    });
    setShowEditModal(true);
  };
  
  // Open delete confirmation modal
  const handleDeleteClick = (resource) => {
    setSelectedResource(resource);
    setShowDeleteModal(true);
  };
  
  // Submit handler for creating a new resource
  const handleCreateResource = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Validate required fields
      if (!formData.name || !formData.resourceType) {
        setError('Nazwa i typ zasobu są wymagane.');
        setLoading(false);
        return;
      }
      
      // Convert numeric fields
      const resourceData = {
        ...formData,
        capacity: formData.capacity ? parseFloat(formData.capacity) : null,
        costPerHour: formData.costPerHour ? parseFloat(formData.costPerHour) : null
      };
      
      await createResource(resourceData);
      setSuccess('Zasób został pomyślnie dodany.');
      
      // Refresh resources list
      setTimeout(() => {
        onResourcesChange();
        setShowAddModal(false);
      }, 1000);
      
    } catch (err) {
      console.error('Error creating resource:', err);
      setError('Nie udało się utworzyć zasobu. Spróbuj ponownie później.');
    } finally {
      setLoading(false);
    }
  };
  
  // Submit handler for updating a resource
  const handleUpdateResource = async () => {
    if (!selectedResource) return;
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Validate required fields
      if (!formData.name || !formData.resourceType) {
        setError('Nazwa i typ zasobu są wymagane.');
        setLoading(false);
        return;
      }
      
      // Convert numeric fields
      const resourceData = {
        ...selectedResource,
        name: formData.name,
        resourceType: formData.resourceType,
        department: formData.department,
        capacity: formData.capacity ? parseFloat(formData.capacity) : null,
        costPerHour: formData.costPerHour ? parseFloat(formData.costPerHour) : null,
        capabilities: formData.capabilities,
        workingHours: formData.workingHours,
        daysOff: formData.daysOff,
        notes: formData.notes,
        isActive: formData.isActive
      };
      
      await updateResource(selectedResource.id, resourceData);
      setSuccess('Zasób został pomyślnie zaktualizowany.');
      
      // Refresh resources list
      setTimeout(() => {
        onResourcesChange();
        setShowEditModal(false);
      }, 1000);
      
    } catch (err) {
      console.error('Error updating resource:', err);
      setError('Nie udało się zaktualizować zasobu. Spróbuj ponownie później.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handler for deleting a resource
  const handleDeleteResource = async () => {
    if (!selectedResource) return;
    
    setLoading(true);
    setError(null);
    
    try {
      await deleteResource(selectedResource.id);
      
      // Refresh resources list
      onResourcesChange();
      setShowDeleteModal(false);
      
    } catch (err) {
      console.error('Error deleting resource:', err);
      setError('Nie udało się usunąć zasobu. Sprawdź, czy nie jest przypisany do żadnych zadań.');
    } finally {
      setLoading(false);
    }
  };
  
  // Get badge color based on resource type
  const getResourceTypeBadge = (type) => {
    switch (type) {
      case 'Machine':
        return 'primary';
      case 'Person':
        return 'success';
      case 'Tool':
        return 'warning';
      case 'Line':
        return 'info';
      default:
        return 'secondary';
    }
  };
  
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Lista zasobów</h4>
        <Button variant="primary" onClick={handleAddResource}>
          <FaPlus className="me-1" /> Dodaj zasób
        </Button>
      </div>
      
      {resources.length === 0 ? (
        <Card body className="text-center">
          <p className="mb-0">Brak dostępnych zasobów. Dodaj pierwszy zasób, aby rozpocząć.</p>
        </Card>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Nazwa</th>
              <th>Typ</th>
              <th>Dział</th>
              <th>Wydajność</th>
              <th>Koszt/h</th>
              <th>Status</th>
              <th>Akcje</th>
            </tr>
          </thead>
          <tbody>
            {resources.map(resource => (
              <tr key={resource.id}>
                <td>{resource.name}</td>
                <td>
                  <Badge bg={getResourceTypeBadge(resource.resourceType)}>
                    {resource.resourceType}
                  </Badge>
                </td>
                <td>{resource.department || '-'}</td>
                <td>{resource.capacity || '-'}</td>
                <td>{resource.costPerHour ? `${resource.costPerHour} zł` : '-'}</td>
                <td>
                  <Badge bg={resource.isActive ? 'success' : 'secondary'}>
                    {resource.isActive ? 'Aktywny' : 'Nieaktywny'}
                  </Badge>
                </td>
                <td>
                  <Button 
                    variant="outline-primary" 
                    size="sm" 
                    className="me-2"
                    onClick={() => handleEditResource(resource)}
                  >
                    <FaEdit />
                  </Button>
                  <Button 
                    variant="outline-danger" 
                    size="sm"
                    onClick={() => handleDeleteClick(resource)}
                  >
                    <FaTrash />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      
      {/* Add Resource Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Dodaj nowy zasób</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          
          <Form>
            <Row>
              <Col md={8}>
                <Form.Group className="mb-3">
                  <Form.Label>Nazwa</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Typ zasobu</Form.Label>
                  <Form.Select
                    name="resourceType"
                    value={formData.resourceType}
                    onChange={handleInputChange}
                    required
                  >
                    {resourceTypes.map(type => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Dział</Form.Label>
                  <Form.Select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                  >
                    <option value="">Wybierz dział...</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Wydajność</Form.Label>
                  <Form.Control
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    min="0"
                    step="0.1"
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Koszt/godz. (zł)</Form.Label>
                  <Form.Control
                    type="number"
                    name="costPerHour"
                    value={formData.costPerHour}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Możliwości/Umiejętności</Form.Label>
                  <Form.Control
                    type="text"
                    name="capabilities"
                    value={formData.capabilities}
                    onChange={handleInputChange}
                    placeholder="np. frezowanie, wiercenie, montaż"
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Godziny pracy</Form.Label>
                  <Form.Control
                    type="text"
                    name="workingHours"
                    value={formData.workingHours}
                    onChange={handleInputChange}
                    placeholder="np. 08:00-16:00"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Dni wolne</Form.Label>
                  <Form.Control
                    type="text"
                    name="daysOff"
                    value={formData.daysOff}
                    onChange={handleInputChange}
                    placeholder="np. Saturday,Sunday"
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
            
            <Form.Check 
              type="checkbox"
              id="resource-active"
              label="Zasób aktywny"
              name="isActive"
              checked={formData.isActive}
              onChange={handleInputChange}
              className="mb-3"
            />
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)} disabled={loading}>
            Anuluj
          </Button>
          <Button variant="primary" onClick={handleCreateResource} disabled={loading}>
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
              'Dodaj zasób'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Edit Resource Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edytuj zasób</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          
          <Form>
            <Row>
              <Col md={8}>
                <Form.Group className="mb-3">
                  <Form.Label>Nazwa</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Typ zasobu</Form.Label>
                  <Form.Select
                    name="resourceType"
                    value={formData.resourceType}
                    onChange={handleInputChange}
                    required
                  >
                    {resourceTypes.map(type => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Dział</Form.Label>
                  <Form.Select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                  >
                    <option value="">Wybierz dział...</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Wydajność</Form.Label>
                  <Form.Control
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    min="0"
                    step="0.1"
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Koszt/godz. (zł)</Form.Label>
                  <Form.Control
                    type="number"
                    name="costPerHour"
                    value={formData.costPerHour}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Możliwości/Umiejętności</Form.Label>
                  <Form.Control
                    type="text"
                    name="capabilities"
                    value={formData.capabilities}
                    onChange={handleInputChange}
                    placeholder="np. frezowanie, wiercenie, montaż"
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Godziny pracy</Form.Label>
                  <Form.Control
                    type="text"
                    name="workingHours"
                    value={formData.workingHours}
                    onChange={handleInputChange}
                    placeholder="np. 08:00-16:00"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Dni wolne</Form.Label>
                  <Form.Control
                    type="text"
                    name="daysOff"
                    value={formData.daysOff}
                    onChange={handleInputChange}
                    placeholder="np. Saturday,Sunday"
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
            
            <Form.Check 
              type="checkbox"
              id="resource-active-edit"
              label="Zasób aktywny"
              name="isActive"
              checked={formData.isActive}
              onChange={handleInputChange}
              className="mb-3"
            />
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)} disabled={loading}>
            Anuluj
          </Button>
          <Button variant="primary" onClick={handleUpdateResource} disabled={loading}>
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
                Aktualizowanie...
              </>
            ) : (
              'Zapisz zmiany'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Potwierdź usunięcie</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          
          <p>
            Czy na pewno chcesz usunąć zasób <strong>{selectedResource?.name}</strong>?
          </p>
          <p className="text-danger">
            Uwaga: Nie można usunąć zasobu, który jest przypisany do zadań.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)} disabled={loading}>
            Anuluj
          </Button>
          <Button variant="danger" onClick={handleDeleteResource} disabled={loading}>
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
                Usuwanie...
              </>
            ) : (
              'Usuń'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ResourcesPanel;