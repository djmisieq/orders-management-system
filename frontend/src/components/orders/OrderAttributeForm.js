import React, { useState } from 'react';
import { Form, Button, InputGroup, Row, Col, Card, Badge } from 'react-bootstrap';
import { FaPlus, FaTimes } from 'react-icons/fa';

const OrderAttributeForm = ({ attributes, onChange }) => {
  const [newAttribute, setNewAttribute] = useState({
    attributeName: '',
    attributeValue: '',
    attributeType: 'string'
  });
  const [error, setError] = useState('');

  const handleAttributeChange = (e) => {
    const { name, value } = e.target;
    setNewAttribute({
      ...newAttribute,
      [name]: value
    });
    
    if (error) {
      setError('');
    }
  };

  const addAttribute = () => {
    // Validate
    if (!newAttribute.attributeName.trim()) {
      setError('Nazwa atrybutu jest wymagana');
      return;
    }
    
    // Check if attribute with the same name already exists
    const attributeExists = attributes.some(
      attr => attr.attributeName.toLowerCase() === newAttribute.attributeName.toLowerCase()
    );
    
    if (attributeExists) {
      setError('Atrybut o tej nazwie już istnieje');
      return;
    }
    
    // Add new attribute
    const updatedAttributes = [
      ...attributes,
      {
        ...newAttribute,
        id: Date.now() // temporary id for new attributes
      }
    ];
    
    onChange(updatedAttributes);
    
    // Reset form
    setNewAttribute({
      attributeName: '',
      attributeValue: '',
      attributeType: 'string'
    });
  };

  const removeAttribute = (attributeToRemove) => {
    const updatedAttributes = attributes.filter(
      attr => attr.id !== attributeToRemove.id
    );
    
    onChange(updatedAttributes);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addAttribute();
    }
  };

  // Format value based on attribute type
  const formatAttributeValue = (attribute) => {
    if (!attribute.attributeValue) return '-';
    
    switch (attribute.attributeType) {
      case 'number':
        return parseFloat(attribute.attributeValue).toLocaleString();
      case 'boolean':
        return attribute.attributeValue === 'true' ? 'Tak' : 'Nie';
      case 'date':
        try {
          return new Date(attribute.attributeValue).toLocaleDateString();
        } catch (e) {
          return attribute.attributeValue;
        }
      default:
        return attribute.attributeValue;
    }
  };

  // Get badge color based on attribute type
  const getTypeColor = (type) => {
    switch (type) {
      case 'string':
        return 'primary';
      case 'number':
        return 'success';
      case 'boolean':
        return 'warning';
      case 'date':
        return 'info';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="mt-4">
      <h5>Atrybuty niestandardowe</h5>
      
      <Card className="mb-3">
        <Card.Body>
          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Nazwa atrybutu</Form.Label>
                <Form.Control
                  type="text"
                  name="attributeName"
                  value={newAttribute.attributeName}
                  onChange={handleAttributeChange}
                  onKeyPress={handleKeyPress}
                  isInvalid={!!error}
                />
                <Form.Control.Feedback type="invalid">
                  {error}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Wartość</Form.Label>
                <Form.Control
                  type={newAttribute.attributeType === 'date' ? 'date' : 'text'}
                  name="attributeValue"
                  value={newAttribute.attributeValue}
                  onChange={handleAttributeChange}
                  onKeyPress={handleKeyPress}
                />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group className="mb-3">
                <Form.Label>Typ</Form.Label>
                <Form.Select
                  name="attributeType"
                  value={newAttribute.attributeType}
                  onChange={handleAttributeChange}
                >
                  <option value="string">Tekst</option>
                  <option value="number">Liczba</option>
                  <option value="boolean">Tak/Nie</option>
                  <option value="date">Data</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2} className="d-flex align-items-end">
              <Button 
                variant="primary" 
                className="mb-3 w-100" 
                onClick={addAttribute}
              >
                <FaPlus /> Dodaj
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {attributes.length > 0 ? (
        <div className="mb-3">
          <h6>Zdefiniowane atrybuty:</h6>
          <ul className="list-group">
            {attributes.map((attribute, index) => (
              <li key={attribute.id || index} className="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <strong>{attribute.attributeName}</strong>: {formatAttributeValue(attribute)}
                  <Badge bg={getTypeColor(attribute.attributeType)} className="ms-2">
                    {attribute.attributeType === 'string' ? 'Tekst' : 
                     attribute.attributeType === 'number' ? 'Liczba' : 
                     attribute.attributeType === 'boolean' ? 'Tak/Nie' : 
                     'Data'}
                  </Badge>
                </div>
                <Button 
                  variant="outline-danger" 
                  size="sm" 
                  onClick={() => removeAttribute(attribute)}
                >
                  <FaTimes />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-muted">Brak zdefiniowanych atrybutów niestandardowych</p>
      )}
    </div>
  );
};

export default OrderAttributeForm;