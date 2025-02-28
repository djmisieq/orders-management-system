import React, { useState, useEffect } from 'react';
import { AgGridReact } from '@ag-grid-community/react';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-alpine.css';
import axios from 'axios';

const OrdersGrid = () => {
  const [rowData, setRowData] = useState([]);

  const [columnDefs] = useState([
    { headerName: 'Order Number', field: 'orderNumber', sortable: true, filter: true },
    { headerName: 'Customer Name', field: 'customerName', sortable: true, filter: true },
    { headerName: 'Order Date', field: 'orderDate', sortable: true, filter: true },
    { headerName: 'Status', field: 'status', sortable: true, filter: true },
  ]);

  const gridOptions = {
    columnDefs: columnDefs,
    rowData: rowData,
    modules: [ClientSideRowModelModule],
    defaultColDef: {
      flex: 1,
      minWidth: 100,
      resizable: true,
    },
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get('https://localhost:7000/api/orders');
        setRowData(response.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="ag-theme-alpine" style={{ height: 500, width: '100%' }}>
      <AgGridReact {...gridOptions} />
    </div>
  );
};

export default OrdersGrid;