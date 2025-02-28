import React, { useState, useEffect } from 'react';
import { Card, ListGroup, Badge, Spinner, Button } from 'react-bootstrap';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { FaHistory } from 'react-icons/fa';
import axios from 'axios';

const OrderHistory = ({ orderId }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/orders/${orderId}/history`);
        setHistory(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching order history:', err);
        setError('Nie udało się pobrać historii zamówienia.');
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchHistory();
    }
  }, [orderId]);

  // Function to get badge color based on change type
  const getBadgeColor = (changeType) => {
    switch (changeType) {
      case 'Create':
        return 'success';
      case 'Update':
        return 'primary';
      case 'StatusChange':
        return 'warning';
      case 'AttributeAdd':
      case 'AttributeUpdate':
        return 'info';
      case 'AttributeDelete':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  // Format date to a readable format
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'dd MMMM yyyy, HH:mm', { locale: pl });
    } catch (e) {
      return dateString;
    }
  };

  if (!orderId) {
    return null;
  }

  return (
    <Card className="mb-4">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <div>
          <FaHistory className="me-2" />
          Historia zamówienia
        </div>
        {history.length > 0 && (
          <Button variant="outline-secondary" size="sm">
            Eksportuj historię
          </Button>
        )}
      </Card.Header>
      <Card.Body>
        {loading ? (
          <div className="text-center py-4">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Ładowanie...</span>
            </Spinner>
          </div>
        ) : error ? (
          <div className="text-danger">{error}</div>
        ) : history.length === 0 ? (
          <p className="text-muted">Brak wpisów w historii tego zamówienia.</p>
        ) : (
          <ListGroup variant="flush">
            {history.map((entry) => (
              <ListGroup.Item 
                key={entry.id}
                className="d-flex justify-content-between align-items-start"
              >
                <div className="ms-2 me-auto">
                  <div className="fw-bold d-flex align-items-center">
                    <Badge bg={getBadgeColor(entry.changeType)} className="me-2">
                      {entry.changeType === 'Create' && 'Utworzenie'}
                      {entry.changeType === 'Update' && 'Aktualizacja'}
                      {entry.changeType === 'StatusChange' && 'Zmiana statusu'}
                      {entry.changeType === 'AttributeAdd' && 'Dodanie atrybutu'}
                      {entry.changeType === 'AttributeUpdate' && 'Aktualizacja atrybutu'}
                      {entry.changeType === 'AttributeDelete' && 'Usunięcie atrybutu'}
                    </Badge>
                    {entry.description}
                  </div>
                  <div className="text-muted small mt-1">
                    <span>Przez: {entry.userName}</span>
                    <span className="ms-3">{formatDate(entry.changedAt)}</span>
                  </div>

                  {entry.changeType === 'StatusChange' && (
                    <div className="d-flex mt-2">
                      <div className="badge bg-secondary me-2">
                        {entry.oldValue}
                      </div>
                      <div>→</div>
                      <div className="badge bg-success ms-2">
                        {entry.newValue}
                      </div>
                    </div>
                  )}
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Card.Body>
    </Card>
  );
};

export default OrderHistory;