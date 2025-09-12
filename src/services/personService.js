// personService.js
import axios from "axios";

const API_BASE_URL = "http://localhost:9090/api/person";

// Helper: get token from localStorage and format Authorization header
const getAuthHeader = () => {
  const authData = localStorage.getItem("auth_user"); // your saved object
  if (!authData) return {};

  try {
    const parsed = JSON.parse(authData); // parse stored JSON
    const token = parsed.token;          // extract JWT token
    if (token) return { Authorization: `Bearer ${token}` };
  } catch (err) {
    console.error("Failed to parse auth_user from localStorage:", err);
  }
  return {};
};

// GET all persons
export const getAllPersons = async () => {
  try {
    const response = await axios.get(API_BASE_URL, { headers: getAuthHeader() });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch persons:", error);
    throw error;
  }
};

// CREATE new person (admin only)
export const createPerson = async (personData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/register`, personData, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    console.error("Failed to create member:", error);
    throw error;
  }
};

// DELETE person
export const deletePerson = async (id) => {
  try {
    await axios.delete(`${API_BASE_URL}/${id}`, { headers: getAuthHeader() });
  } catch (error) {
    console.error("Failed to delete member:", error);
    throw error;
  }
};

