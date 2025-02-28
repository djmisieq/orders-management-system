import React, { useState, useEffect } from 'react';
import { AgGridReact } from '@ag-grid-community/react';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-alpine.css';

const OrdersGrid = () => {
  const [rowData, setRowData] = useState([]);

  const [columnDefs] = useState([
    { headerName: 'Order Number', field: 'orderNumber' },
    { headerName: 'Customer Name', field: 'customerName' },
    { headerName: 'Order Date', field: 'orderDate' },
    { headerName: 'Status', field: 'status' },
  ]);

  useEffect(() => {
    // Fetch orders from backend
    const fetchOrders = async () => {
      try {
        // Implement API call to backend
        const response = await fetch('/api/orders');
        const data = await response.json();
        setRowData(data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="ag-theme-alpine" style={{ height: 500, width: '100%' }}>
      <AgGridReact
        rowData={rowData}
        columnDefs={columnDefs}
        modules={[ClientSideRowModelModule]}
      />
    </div>
  );
};

export default OrdersGrid;