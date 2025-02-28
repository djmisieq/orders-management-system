import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { Card, Spinner } from 'react-bootstrap';
import { subMonths, format } from 'date-fns';
import { ordersApi } from '../../services/api';

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const OrdersChart = ({ chartType, filterParams }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch all orders
        const orders = await ordersApi.getOrders();
        
        if (orders.length === 0) {
          setData([]);
          return;
        }

        // Process data based on chart type
        let processedData = [];
        
        switch (chartType) {
          case 'statusDistribution':
            // Group orders by status
            const statusCounts = orders.reduce((acc, order) => {
              const status = order.status || 'Unknown';
              acc[status] = (acc[status] || 0) + 1;
              return acc;
            }, {});
            
            processedData = Object.entries(statusCounts).map(([status, count]) => ({
              name: status,
              value: count
            }));
            break;
            
          case 'monthlyTrends':
            // Get orders from the last 6 months
            const sixMonthsAgo = subMonths(new Date(), 6);
            const recentOrders = orders.filter(order => new Date(order.orderDate) >= sixMonthsAgo);
            
            // Group orders by month
            const monthlyData = recentOrders.reduce((acc, order) => {
              const monthKey = format(new Date(order.orderDate), 'yyyy-MM');
              const monthName = format(new Date(order.orderDate), 'MMM yyyy');
              
              if (!acc[monthKey]) {
                acc[monthKey] = {
                  month: monthName,
                  count: 0,
                  totalQuantity: 0
                };
              }
              
              acc[monthKey].count += 1;
              acc[monthKey].totalQuantity += (order.quantity || 0);
              
              return acc;
            }, {});
            
            // Convert to array and sort by month
            processedData = Object.values(monthlyData).sort((a, b) => {
              return new Date(a.month) - new Date(b.month);
            });
            break;
            
          case 'customerDistribution':
            // Group orders by customer
            const customerCounts = orders.reduce((acc, order) => {
              const customer = order.customerName || 'Unknown';
              acc[customer] = (acc[customer] || 0) + 1;
              return acc;
            }, {});
            
            // Sort by count (descending) and take top 5
            processedData = Object.entries(customerCounts)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([customer, count]) => ({
                name: customer,
                value: count
              }));
            break;
            
          default:
            processedData = [];
        }
        
        setData(processedData);
      } catch (error) {
        console.error('Error fetching data for chart:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [chartType, filterParams]);

  const renderChart = () => {
    if (loading) {
      return (
        <div className="text-center py-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Ładowanie...</span>
          </Spinner>
        </div>
      );
    }

    if (data.length === 0) {
      return (
        <div className="text-center py-5">
          <p className="text-muted">Brak danych do wyświetlenia</p>
        </div>
      );
    }

    switch (chartType) {
      case 'statusDistribution':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} zamówień`, 'Ilość']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
        
      case 'monthlyTrends':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="count"
                name="Liczba zamówień"
                stroke="#8884d8"
                activeDot={{ r: 8 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="totalQuantity"
                name="Łączna ilość"
                stroke="#82ca9d"
              />
            </LineChart>
          </ResponsiveContainer>
        );
        
      case 'customerDistribution':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" name="Liczba zamówień" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        );
        
      default:
        return (
          <div className="text-center py-5">
            <p className="text-muted">Wybierz typ wykresu</p>
          </div>
        );
    }
  };

  return (
    <Card>
      <Card.Body>
        {renderChart()}
      </Card.Body>
    </Card>
  );
};

export default OrdersChart;