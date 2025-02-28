import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Get all production tasks with optional filtering
export const getProductionTasks = async (filters = {}) => {
  try {
    let queryParams = '';
    if (filters.startDate) {
      queryParams += `startDate=${filters.startDate.toISOString()}&`;
    }
    if (filters.endDate) {
      queryParams += `endDate=${filters.endDate.toISOString()}&`;
    }
    if (filters.status) {
      queryParams += `status=${filters.status}&`;
    }
    if (filters.orderId) {
      queryParams += `orderId=${filters.orderId}&`;
    }
    
    // Remove trailing & if present
    if (queryParams.endsWith('&')) {
      queryParams = queryParams.slice(0, -1);
    }
    
    const url = `${BASE_URL}/productiontasks${queryParams ? `?${queryParams}` : ''}`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching production tasks:', error);
    throw error;
  }
};

// Get a specific production task by ID
export const getProductionTaskById = async (id) => {
  try {
    const response = await axios.get(`${BASE_URL}/productiontasks/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching production task ${id}:`, error);
    throw error;
  }
};

// Get production tasks for a specific order
export const getTasksByOrder = async (orderId) => {
  try {
    const response = await axios.get(`${BASE_URL}/productiontasks/order/${orderId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching tasks for order ${orderId}:`, error);
    throw error;
  }
};

// Get calendar-formatted tasks for the scheduler
export const getCalendarTasks = async (startDate, endDate) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/productiontasks/calendar?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching calendar tasks:', error);
    throw error;
  }
};

// Create a new production task
export const createProductionTask = async (taskData) => {
  try {
    const response = await axios.post(`${BASE_URL}/productiontasks`, taskData);
    return response.data;
  } catch (error) {
    console.error('Error creating production task:', error);
    throw error;
  }
};

// Update an existing production task
export const updateProductionTask = async (id, taskData) => {
  try {
    const response = await axios.put(`${BASE_URL}/productiontasks/${id}`, taskData);
    return response.data;
  } catch (error) {
    console.error(`Error updating production task ${id}:`, error);
    throw error;
  }
};

// Reschedule a task to a new date
export const rescheduleTask = async (taskId, newStartDate, userId, userName) => {
  try {
    const response = await axios.post(`${BASE_URL}/productiontasks/reschedule`, {
      taskId,
      newStartDate,
      userId,
      userName
    });
    return response.data;
  } catch (error) {
    console.error(`Error rescheduling task ${taskId}:`, error);
    throw error;
  }
};

// Assign a resource to a task
export const assignResource = async (assignmentData) => {
  try {
    const response = await axios.post(`${BASE_URL}/productiontasks/assign-resource`, assignmentData);
    return response.data;
  } catch (error) {
    console.error('Error assigning resource to task:', error);
    throw error;
  }
};

// Remove resource assignment from a task
export const unassignResource = async (taskId, resourceId) => {
  try {
    const response = await axios.delete(`${BASE_URL}/productiontasks/unassign-resource/${taskId}/${resourceId}`);
    return response.data;
  } catch (error) {
    console.error(`Error unassigning resource ${resourceId} from task ${taskId}:`, error);
    throw error;
  }
};

// Delete a production task
export const deleteProductionTask = async (id) => {
  try {
    const response = await axios.delete(`${BASE_URL}/productiontasks/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting production task ${id}:`, error);
    throw error;
  }
};