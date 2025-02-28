import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { Button, Row, Col, Spinner } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaDownload, FaEye } from 'react-icons/fa';
import { format } from 'date-fns';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { ordersApi } from '../../services/api';
import OrderForm from './OrderForm';
import OrdersFilter from './OrdersFilter';
import './OrdersGrid.css';

const OrdersGrid = () => {
  const [rowData, setRowData] = useState([]);
  const [gridApi, setGridApi] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [orderToEdit, setOrderToEdit] = useState(null);
  const [filterModel, setFilterModel] = useState({});

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

    // Apply saved filter model if exists
    if (Object.keys(filterModel).length > 0) {
      params.api.setFilterModel(filterModel);
    }
  };

  const dateFormatter = (params) => {
    return params.value ? format(new Date(params.value), 'dd/MM/yyyy') : '';
  };

  const statusFormatter = (params) => {
    switch (params.value) {
      case 'New':
        return 'Nowe';
      case 'In Progress':
        return 'W trakcie';
      case 'Completed':
        return 'Zakończone';
      case 'Cancelled':
        return 'Anulowane';
      default:
        return params.value;
    }
  };

  const statusCellStyle = (params) => {
    switch (params.value) {
      case 'New':
        return { color: '#0d6efd', fontWeight: 'bold' };
      case 'In Progress':
        return { color: '#ffc107', fontWeight: 'bold' };
      case 'Completed':
        return { color: '#198754', fontWeight: 'bold' };
      case 'Cancelled':
        return { color: '#dc3545', fontWeight: 'bold' };
      default:
        return null;
    }
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
    setOrderToEdit(null);
    setShowOrderForm(true);
  };

  const handleEditOrder = () => {
    if (!selectedOrder) return;
    setOrderToEdit(selectedOrder);
    setShowOrderForm(true);
  };

  const handleCloseOrderForm = () => {
    setShowOrderForm(false);
    setOrderToEdit(null);
  };

  const handleOrderSaved = () => {
    fetchOrders();
  };

  const handleFilterChange = (newFilterModel) => {
    setFilterModel(newFilterModel);
    
    if (gridApi) {
      gridApi.setFilterModel(newFilterModel);
    }
  };

  const handleExportCsv = () => {
    if (gridApi) {
      const params = {
        fileName: `zamowienia-${format(new Date(), 'yyyy-MM-dd')}.csv`,
        processCellCallback: (params) => {
          // Format date fields for CSV export
          if (params.column.colId === 'orderDate' && params.value) {
            return format(new Date(params.value), 'dd/MM/yyyy');
          }
          
          // Format status fields for CSV export
          if (params.column.colId === 'status') {
            return statusFormatter(params);
          }
          
          return params.value;
        }
      };
      
      gridApi.exportDataAsCsv(params);
    }
  };
  
  // Column definitions with enhanced sorting
  const columnDefs = useMemo(() => [
    { 
      field: 'id', 
      headerName: 'ID', 
      sortable: true, 
      filter: 'agNumberColumnFilter',
      width: 80,
      sort: 'desc' // Default sort by ID descending (newest first)
    },
    { 
      field: 'customerName', 
      headerName: 'Klient',
      sortable: true, 
      filter: 'agTextColumnFilter',
      filterParams: {
        filterOptions: ['contains', 'equals'],
        debounceMs: 200
      },
      flex: 1,
      minWidth: 150
    },
    { 
      field: 'orderDate', 
      headerName: 'Data zamówienia',
      sortable: true, 
      filter: 'agDateColumnFilter',
      filterParams: {
        comparator: (filterLocalDateAtMidnight, cellValue) => {
          const cellDate = new Date(cellValue);
          if (cellDate < filterLocalDateAtMidnight) {
            return -1;
          } else if (cellDate > filterLocalDateAtMidnight) {
            return 1;
          }
          return 0;
        }
      },
      valueFormatter: dateFormatter,
      minWidth: 150
    },
    { 
      field: 'quantity', 
      headerName: 'Ilość',
      sortable: true, 
      filter: 'agNumberColumnFilter',
      width: 100
    },
    { 
      field: 'status', 
      headerName: 'Status',
      sortable: true, 
      filter: 'agSetColumnFilter',
      filterParams: {
        values: ['New', 'In Progress', 'Completed', 'Cancelled']
      },
      valueFormatter: statusFormatter,
      cellStyle: statusCellStyle,
      width: 120
    },
    {
      field: 'description',
      headerName: 'Opis',
      sortable: true,
      filter: 'agTextColumnFilter',
      flex: 1,
      minWidth: 200
    }
  ], []);

  // Default column configuration with enhanced filtering
  const defaultColDef = useMemo(() => ({
    resizable: true,
    sortable: true,
    filter: true,
    floatingFilter: true // This adds quick filters below each column header
  }), []);

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
            className="me-2"
            disabled={!selectedOrder}
          >
            <FaTrash /> Usuń
          </Button>
          <Button 
            variant="success" 
            onClick={handleExportCsv}
          >
            <FaDownload /> Eksport CSV
          </Button>
        </Col>
      </Row>

      <OrdersFilter onFilterChange={handleFilterChange} />

      {loading && (
        <div className="text-center my-4">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Ładowanie...</span>
          </Spinner>
        </div>
      )}

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
          enableCellTextSelection={true}
          suppressRowClickSelection={false}
          rowClass="order-row"
        />
      </div>

      <OrderForm 
        show={showOrderForm} 
        handleClose={handleCloseOrderForm} 
        editOrder={orderToEdit}
        onOrderSaved={handleOrderSaved}
      />
    </div>
  );
};

export default OrdersGrid;