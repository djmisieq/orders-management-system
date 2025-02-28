import React, { useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import OrdersGrid from '../components/orders/OrdersGrid';
import OrderDetails from '../components/orders/OrderDetails';
import OrderForm from '../components/orders/OrderForm';

const Orders = () => {
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [orderToEdit, setOrderToEdit] = useState(null);

  // Handler for viewing order details
  const handleViewOrder = (orderId) => {
    setSelectedOrderId(orderId);
  };

  // Handler for going back to the list view
  const handleBackToList = () => {
    setSelectedOrderId(null);
  };

  // Handler for opening the add order form
  const handleAddOrder = () => {
    setOrderToEdit(null);
    setShowOrderForm(true);
  };

  // Handler for opening the edit order form
  const handleEditOrder = (order) => {
    setOrderToEdit(order);
    setShowOrderForm(true);
  };

  // Handler for closing the order form
  const handleCloseOrderForm = () => {
    setShowOrderForm(false);
    setOrderToEdit(null);
  };

  // Handler after successfully saving an order
  const handleOrderSaved = () => {
    setShowOrderForm(false);
    setOrderToEdit(null);
    // If we were in details view, refresh the order details
    if (selectedOrderId) {
      // We could fetch the updated order here, but for now we'll just go back to list
      setSelectedOrderId(null);
    }
  };

  return (
    <div>
      {!selectedOrderId ? (
        <>
          <Row className="mb-4">
            <Col>
              <h1>Zarządzanie zamówieniami</h1>
              <p className="text-muted">Przeglądaj, dodawaj i zarządzaj zamówieniami produkcyjnymi</p>
            </Col>
          </Row>
          <OrdersGrid 
            onViewOrder={handleViewOrder} 
            onAddOrder={handleAddOrder}
            onEditOrder={handleEditOrder}
          />
        </>
      ) : (
        <OrderDetails 
          orderId={selectedOrderId} 
          onBack={handleBackToList} 
          onEdit={handleEditOrder}
        />
      )}

      <OrderForm 
        show={showOrderForm}
        handleClose={handleCloseOrderForm}
        editOrder={orderToEdit}
        onOrderSaved={handleOrderSaved}
      />
    </div>
  );
};

export default Orders;