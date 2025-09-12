import axios from "axios";

const BASE_URL = "http://localhost:9090/api";
const TOKEN_KEY = "auth_token";

const getAuthHeader = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const TaskService = {
  // Fetch all tasks
  async getTasks() {
    try {
      const response = await axios.get(`${BASE_URL}/todo`, {
        headers: getAuthHeader(),
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching tasks:", error);
      throw error;
    }
  },

  // Create a new task
async createTask(taskData, attachments = []) {
  try {
    const formData = new FormData();

    // NEW: Ensure personId is a number (Long) and attachments array exists
    const payload = {
      ...taskData,
      personId: Number(taskData.personId), // NEW
      attachments: [], // attachments sent separately
    };

    formData.append(
      "todo",
      new Blob([JSON.stringify(payload)], { type: "application/json" })
    );

    // Append actual files
    attachments.forEach(file => formData.append("files", file));

    const response = await axios.post(`${BASE_URL}/todo`, formData, {
      headers: {
        ...getAuthHeader(),
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    console.error(
      "Error creating task:",
      error.response?.data || error.message
    );
    throw error;
  }
},

// Update an existing task
async updateTask(taskId, taskData, attachments = []) {
  try {
    const formData = new FormData();

    // NEW: Ensure personId is a number (Long) and attachments array exists
    const payload = {
      ...taskData,
      personId: Number(taskData.personId), // NEW
      attachments: [], // attachments sent separately
    };

    formData.append(
      "todo",
      new Blob([JSON.stringify(payload)], { type: "application/json" })
    );

    // Append actual files
    attachments.forEach(file => formData.append("files", file));

    const response = await axios.put(`${BASE_URL}/todo/${taskId}`, formData, {
      headers: {
        ...getAuthHeader(),
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    console.error(
      "Error updating task:",
      error.response?.data || error.message
    );
    throw error;
  }
},


  async deleteTask(taskId) {
    try {
      const response = await axios.delete(`${BASE_URL}/todo/${taskId}`, {
        headers: getAuthHeader(),
      });
      return response.data;
    } catch (error) {
      console.error("Error deleting task:", error);
      throw error;
    }
  },

  async getPersons() {
    try {
      const response = await axios.get(`${BASE_URL}/person`, {
        headers: getAuthHeader(),
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching persons:", error);
      throw error;
    }
  },

  async downloadAttachment(attachmentId) {
    try {
      const response = await axios.get(
        `${BASE_URL}/todo/attachments/${attachmentId}`,
        {
          headers: getAuthHeader(),
          responseType: "blob",
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error downloading attachment:", error);
      throw error;
    }
  },
};

export default TaskService;

