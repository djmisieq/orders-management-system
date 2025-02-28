import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const getAllResources = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/resources`);
    return response.data;
  } catch (error) {
    console.error('Error fetching resources:', error);
    throw error;
  }
};

export const getResourceById = async (id) => {
  try {
    const response = await axios.get(`${BASE_URL}/resources/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching resource ${id}:`, error);
    throw error;
  }
};

export const getResourcesByType = async (type) => {
  try {
    const response = await axios.get(`${BASE_URL}/resources/type/${type}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching resources of type ${type}:`, error);
    throw error;
  }
};

export const getResourcesByDepartment = async (department) => {
  try {
    const response = await axios.get(`${BASE_URL}/resources/department/${department}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching resources from department ${department}:`, error);
    throw error;
  }
};

export const createResource = async (resourceData) => {
  try {
    const response = await axios.post(`${BASE_URL}/resources`, resourceData);
    return response.data;
  } catch (error) {
    console.error('Error creating resource:', error);
    throw error;
  }
};

export const updateResource = async (id, resourceData) => {
  try {
    const response = await axios.put(`${BASE_URL}/resources/${id}`, resourceData);
    return response.data;
  } catch (error) {
    console.error(`Error updating resource ${id}:`, error);
    throw error;
  }
};

export const deleteResource = async (id) => {
  try {
    const response = await axios.delete(`${BASE_URL}/resources/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting resource ${id}:`, error);
    throw error;
  }
};

export const getResourceAvailability = async (startDate, endDate, resourceId = null) => {
  try {
    let url = `${BASE_URL}/resources/availability?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`;
    
    if (resourceId) {
      url += `&resourceId=${resourceId}`;
    }
    
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching resource availability:', error);
    throw error;
  }
};