import React, { useState, useEffect } from 'react';
import { Card, ListGroup, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { FaComment, FaPaperclip, FaRegSmile, FaTrash, FaPaperPlane } from 'react-icons/fa';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { authService } from '../../services/auth';
import axios from 'axios';

const OrderComments = ({ orderId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/orders/${orderId}/comments`);
        setComments(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching order comments:', err);
        setError('Nie udało się pobrać komentarzy do zamówienia.');
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchComments();
    }
  }, [orderId]);

  const handleCommentChange = (e) => {
    setNewComment(e.target.value);
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim()) {
      return;
    }
    
    setSubmitting(true);
    
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/orders/${orderId}/comments`, {
        content: newComment,
        // Backend will set the userId and userName
      });
      
      // Add new comment to the list
      setComments([response.data, ...comments]);
      
      // Clear the form
      setNewComment('');
      setError(null);
    } catch (err) {
      console.error('Error adding comment:', err);
      setError('Nie udało się dodać komentarza. Spróbuj ponownie.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm('Czy na pewno chcesz usunąć ten komentarz?')) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL}/orders/${orderId}/comments/${commentId}`);
        
        // Remove comment from the list
        setComments(comments.filter(comment => comment.id !== commentId));
        setError(null);
      } catch (err) {
        console.error('Error deleting comment:', err);
        setError('Nie udało się usunąć komentarza. Spróbuj ponownie.');
      }
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

  // Check if user can delete a comment (owner or admin)
  const canDeleteComment = (comment) => {
    return currentUser && (
      currentUser.role === 'Admin' || 
      currentUser.id === comment.userId
    );
  };

  if (!orderId) {
    return null;
  }

  return (
    <Card className="mb-4">
      <Card.Header>
        <FaComment className="me-2" />
        Komentarze
      </Card.Header>
      <Card.Body>
        {error && (
          <Alert variant="danger">{error}</Alert>
        )}
        
        <Form onSubmit={handleSubmitComment} className="mb-4">
          <Form.Group>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Dodaj komentarz..."
              value={newComment}
              onChange={handleCommentChange}
              disabled={submitting}
            />
          </Form.Group>
          <div className="d-flex justify-content-between align-items-center mt-2">
            <div>
              <Button 
                variant="outline-secondary" 
                size="sm" 
                className="me-2"
                disabled={submitting}
              >
                <FaPaperclip /> Załącznik
              </Button>
              <Button 
                variant="outline-secondary" 
                size="sm"
                disabled={submitting}
              >
                <FaRegSmile /> Emoji
              </Button>
            </div>
            <Button 
              type="submit" 
              variant="primary"
              disabled={!newComment.trim() || submitting}
            >
              {submitting ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Wysyłanie...
                </>
              ) : (
                <>
                  <FaPaperPlane className="me-2" /> Wyślij
                </>
              )}
            </Button>
          </div>
        </Form>
        
        {loading ? (
          <div className="text-center py-4">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Ładowanie...</span>
            </Spinner>
          </div>
        ) : comments.length === 0 ? (
          <p className="text-muted text-center">Brak komentarzy do tego zamówienia.</p>
        ) : (
          <ListGroup variant="flush">
            {comments.map((comment) => (
              <ListGroup.Item key={comment.id}>
                <div className="d-flex justify-content-between align-items-top mb-2">
                  <div className="fw-bold">{comment.userName}</div>
                  <div className="d-flex align-items-center">
                    <small className="text-muted me-3">
                      {formatDate(comment.createdAt)}
                    </small>
                    {canDeleteComment(comment) && (
                      <Button 
                        variant="link" 
                        size="sm" 
                        className="text-danger p-0" 
                        onClick={() => handleDeleteComment(comment.id)}
                      >
                        <FaTrash />
                      </Button>
                    )}
                  </div>
                </div>
                <p>{comment.content}</p>
                {comment.attachmentPath && (
                  <div className="mt-2">
                    <a 
                      href={comment.attachmentPath} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="d-inline-flex align-items-center"
                    >
                      <FaPaperclip className="me-1" />
                      {comment.attachmentName || 'Załącznik'}
                    </a>
                  </div>
                )}
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Card.Body>
    </Card>
  );
};

export default OrderComments;