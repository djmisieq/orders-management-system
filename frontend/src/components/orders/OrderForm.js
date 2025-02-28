import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Spinner } from 'react-bootstrap';
import { format } from 'date-fns';
import { ordersApi } from '../../services/api';

const OrderForm = ({ show, handleClose, editOrder = null, onOrderSaved }) => {
  const initialFormState = {
    customerName: '',
    orderDate: format(new Date(), 'yyyy-MM-dd'),
    quantity: 0,
    status: 'New',
    description: ''
  };

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attributes, setAttributes] = useState([]);

  // Reset form when modal opens/closes or when editOrder changes
  useEffect(() => {
    if (show) {
      if (editOrder) {
        // Edit mode - populate form with existing order data
        setFormData({
          id: editOrder.id,
          customerName: editOrder.customerName || '',
          orderDate: editOrder.orderDate
            ? format(new Date(editOrder.orderDate), 'yyyy-MM-dd')
            : format(new Date(), 'yyyy-MM-dd'),
          quantity: editOrder.quantity || 0,
          status: editOrder.status || 'New',
          description: editOrder.description || ''
        });
        
        // Set attributes if they exist
        if (editOrder.attributes && editOrder.attributes.length > 0) {
          setAttributes(editOrder.attributes);
        } else {
          setAttributes([]);
        }
      } else {
        // Add mode - reset form
        setFormData(initialFormState);
        setAttributes([]);
      }
      
      setErrors({});
    }
  }, [show, editOrder]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Nazwa klienta jest wymagana';
    }
    
    if (!formData.orderDate) {
      newErrors.orderDate = 'Data zamówienia jest wymagana';
    }
    
    if (formData.quantity <= 0) {
      newErrors.quantity = 'Ilość musi być większa od zera';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const orderToSave = {
        ...formData,
        // Make sure quantity is a number
        quantity: parseInt(formData.quantity, 10),
        // Add attributes if there are any
        attributes: attributes
      };
      
      let savedOrder;
      
      if (editOrder) {
        // Update existing order
        savedOrder = await ordersApi.updateOrder(editOrder.id, orderToSave);
      } else {
        // Create new order
        savedOrder = await ordersApi.createOrder(orderToSave);
      }
      
      // Call the callback function to refresh the orders list
      if (onOrderSaved) {
        onOrderSaved(savedOrder);
      }
      
      // Close the modal
      handleClose();
    } catch (error) {
      console.error('Error saving order:', error);
      // Handle errors, e.g. show toast notification
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{editOrder ? 'Edytuj zamówienie' : 'Dodaj nowe zamówienie'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Nazwa klienta</Form.Label>
                <Form.Control
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleChange}
                  isInvalid={!!errors.customerName}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.customerName}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Data zamówienia</Form.Label>
                <Form.Control
                  type="date"
                  name="orderDate"
                  value={formData.orderDate}
                  onChange={handleChange}
                  isInvalid={!!errors.orderDate}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.orderDate}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Ilość</Form.Label>
                <Form.Control
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  isInvalid={!!errors.quantity}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.quantity}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="New">Nowe</option>
                  <option value="In Progress">W trakcie</option>
                  <option value="Completed">Zakończone</option>
                  <option value="Cancelled">Anulowane</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          <Form.Group className="mb-3">
            <Form.Label>Opis</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
          </Form.Group>
          
          {/* we'll add custom attributes editor in the next step */}
          
          <div className="d-flex justify-content-end">
            <Button variant="secondary" onClick={handleClose} className="me-2">
              Anuluj
            </Button>
            <Button variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                  Zapisywanie...
                </>
              ) : (
                'Zapisz'
              )}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default OrderForm;