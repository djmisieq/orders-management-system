import React, { useState, useEffect, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { Button, Row, Col } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { format } from 'date-fns';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { ordersApi } from '../../services/api';
import './OrdersGrid.css';

const OrdersGrid = () => {
  const [rowData, setRowData] = useState([]);
  const [gridApi, setGridApi] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await ordersApi.getOrders();
      setRowData(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      // Add toast notification here if you have a toast library
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const onGridReady = (params) => {
    setGridApi(params.api);
  };

  const dateFormatter = (params) => {
    return params.value ? format(new Date(params.value), 'dd/MM/yyyy') : '';
  };

  const onRowSelected = () => {
    const selectedNodes = gridApi?.getSelectedNodes();
    setSelectedOrder(selectedNodes?.length > 0 ? selectedNodes[0].data : null);
  };

  const handleDelete = async () => {
    if (!selectedOrder) return;
    
    if (window.confirm('Czy na pewno chcesz usunąć to zamówienie?')) {
      try {
        await ordersApi.deleteOrder(selectedOrder.id);
        await fetchOrders();
      } catch (error) {
        console.error('Error deleting order:', error);
        // Add toast notification here if you have a toast library
      }
    }
  };

  const handleAddOrder = () => {
    // Navigate to add order form or open modal
    console.log('Add order clicked');
  };

  const handleEditOrder = () => {
    if (!selectedOrder) return;
    // Navigate to edit order form or open modal
    console.log('Edit order clicked', selectedOrder);
  };

  // Column definitions
  const [columnDefs] = useState([
    { 
      field: 'id', 
      headerName: 'ID', 
      sortable: true, 
      filter: true,
      width: 100 
    },
    { 
      field: 'customerName', 
      headerName: 'Klient',
      sortable: true, 
      filter: true,
      flex: 1,
      minWidth: 150
    },
    { 
      field: 'orderDate', 
      headerName: 'Data zamówienia',
      sortable: true, 
      filter: true,
      valueFormatter: dateFormatter,
      minWidth: 180
    },
    { 
      field: 'quantity', 
      headerName: 'Ilość',
      sortable: true, 
      filter: true,
      width: 120
    },
    { 
      field: 'status', 
      headerName: 'Status',
      sortable: true, 
      filter: true,
      width: 150
    }
  ]);

  // Default column configuration
  const defaultColDef = {
    resizable: true,
    sortable: true,
    filter: true
  };

  return (
    <div className="orders-grid">
      <Row className="mb-3">
        <Col>
          <h2>Zamówienia</h2>
        </Col>
        <Col xs="auto">
          <Button 
            variant="primary" 
            onClick={handleAddOrder}
            className="me-2"
          >
            <FaPlus /> Nowe zamówienie
          </Button>
          <Button 
            variant="secondary" 
            onClick={handleEditOrder}
            className="me-2"
            disabled={!selectedOrder}
          >
            <FaEdit /> Edytuj
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDelete}
            disabled={!selectedOrder}
          >
            <FaTrash /> Usuń
          </Button>
        </Col>
      </Row>

      <div className="ag-theme-alpine orders-grid-container">
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          pagination={true}
          paginationPageSize={10}
          rowSelection="single"
          onGridReady={onGridReady}
          onSelectionChanged={onRowSelected}
          animateRows={true}
          domLayout="autoHeight"
        />
      </div>
    </div>
  );
};

export default OrdersGrid;