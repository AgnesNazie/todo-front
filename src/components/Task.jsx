import React, { useState, useEffect } from "react";
import "./Task.css";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useAuth } from "../context/AuthContext";
import TaskService from "../services/taskService";

const Task = () => {
  const { user, isAdmin } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [persons, setPersons] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [filters, setFilters] = useState({ status: "", assignee: "" });
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch all tasks
  const fetchTasks = async () => {
    try {
      let data = await TaskService.getTasks();
      if (!Array.isArray(data)) data = [data];
      if (!isAdmin()) {
        data = data.filter(
          task => task.personId === user.id || task.createdById === user.id
        );
      }
      setTasks(data);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    }
  };

  // Fetch all persons for admin assignment
  const fetchPersons = async () => {
    try {
      const data = await TaskService.getPersons();
      setPersons(data);
    } catch (error) {
      console.error("Failed to fetch persons:", error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTasks();
      fetchPersons();
    }
  }, [user]);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    completed: false
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    setAttachments(Array.from(e.target.files));
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      dueDate: "",
      completed: false
    });
    setAttachments([]);
    setSelectedTask(null);
  };

  // Create or update task
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || formData.title.trim().length < 2) {
      return alert("Title must be at least 2 characters long.");
    }

    const taskData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      completed: formData.completed,
      dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null
    };

    // For admins, assign task to selected person when creating
    if (!selectedTask && isAdmin() && formData.personId) {
      taskData.personId = Number(formData.personId);
    }

    try {
      if (selectedTask) {
        await TaskService.updateTask(selectedTask.id, taskData, attachments);
      } else {
        await TaskService.createTask(taskData, attachments);
      }
      resetForm();
      fetchTasks();
    } catch (error) {
      console.error("Failed to save task:", error.response?.data || error.message);
    }
  };

  // Delete task
  const handleDelete = async (task) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await TaskService.deleteTask(task.id);
      fetchTasks();
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  // Complete task
  const handleComplete = async (task) => {
    try {
      await TaskService.updateTask(task.id, { 
        title: task.title,
        description: task.description,
        completed: true,
        dueDate: task.dueDate
      });
      fetchTasks();
    } catch (error) {
      console.error("Failed to complete task:", error);
    }
  };

  // Edit task
  const handleEdit = (task) => {
    setSelectedTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      dueDate: task.dueDate ? task.dueDate.substring(0, 16) : "",
      completed: task.completed
    });
    setAttachments([]);
  };

  // Filtered tasks
  const filteredTasks = tasks
    .filter(task =>
      filters.status
        ? filters.status === "completed"
          ? task.completed
          : !task.completed
        : true
    )
    .filter(task =>
      filters.assignee ? task.personId === parseInt(filters.assignee) : true
    )
    .filter(task =>
      searchTerm ? task.title.toLowerCase().includes(searchTerm.toLowerCase()) : true
    );

  if (!user) return <div>Loading user info...</div>;

  return (
    <div className="dashboard-layout">
      <Sidebar isOpen={false} onClose={() => {}} />
      <main className="dashboard-main">
        <Header title="Tasks" subtitle="Manage and organize your tasks" onToggleSidebar={() => {}} />
        <div className="dashboard-content">
          <div className="row">
            <div className="col-md-8 mx-auto">
              {/* Task Form */}
              <div className="card shadow-sm task-form-section">
                <div className="card-body">
                  <h2 className="card-title mb-4">{selectedTask ? "Edit Task" : "Add New Task"}</h2>
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label className="form-label">Title</label>
                      <input
                        type="text"
                        className="form-control"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Description</label>
                      <textarea
                        className="form-control"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={3}
                      />
                    </div>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Due Date</label>
                        <input
                          type="datetime-local"
                          className="form-control"
                          name="dueDate"
                          value={formData.dueDate}
                          onChange={handleInputChange}
                        />
                      </div>
                      {isAdmin() && (
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Assign to Person</label>
                          <select
                            className="form-select"
                            name="personId"
                            value={formData.personId || ""}
                            onChange={handleInputChange}
                          >
                            <option value="">-- Select Person --</option>
                            {persons.map(p => (
                              <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Attachments</label>
                      <input
                        type="file"
                        className="form-control"
                        multiple
                        onChange={handleFileChange}
                      />
                      <div className="file-list">
                        {attachments.map((file, idx) => (
                          <div key={idx} className="file-item">
                            {file.name}
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger ms-2"
                              onClick={() => setAttachments(prev => prev.filter((_, i) => i !== idx))}
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                      <button type="submit" className="btn btn-primary">
                        {selectedTask ? "Update Task" : "Add Task"}
                      </button>
                      {selectedTask && (
                        <button type="button" className="btn btn-secondary" onClick={resetForm}>
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              </div>

              {/* Tasks List */}
              <div className="card shadow-sm tasks-list mt-4">
                <div className="card-header bg-white d-flex justify-content-between align-items-center">
                  <h5 className="card-title mb-0">Tasks</h5>
                  <div className="d-flex gap-2">
                    <input
                      type="text"
                      placeholder="Search..."
                      className="form-control form-control-sm"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <select
                      className="form-select form-select-sm"
                      value={filters.status}
                      onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    >
                      <option value="">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                    </select>
                    {isAdmin() && (
                      <select
                        className="form-select form-select-sm"
                        value={filters.assignee}
                        onChange={(e) => setFilters({ ...filters, assignee: e.target.value })}
                      >
                        <option value="">All Assignees</option>
                        {persons.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
                <div className="card-body">
                  <div className="list-group">
                    {filteredTasks.map(task => {
                      const canEditDelete = task.createdById === user.id || (isAdmin() && task.createdById === user.id);
                      const canComplete = task.createdById === user.id || isAdmin();
                      return (
                        <div
                          key={task.id}
                          className={`list-group-item list-group-item-action ${task.completed ? "completed-task" : ""} ${
                            !task.completed && task.dueDate && new Date(task.dueDate) < new Date() ? "overdue-task" : ""
                          }`}
                        >
                          <div className="d-flex w-100 justify-content-between align-items-start">
                            <div className="flex-grow-1">
                              <div className="d-flex justify-content-between">
                                <h6 className="mb-1">{task.title}</h6>
                                <small className="text-muted ms-2">
                                  Created: {new Date(task.createdAt).toLocaleDateString()}
                                </small>
                              </div>
                              <p className="mb-1 text-muted small">{task.description}</p>
                              <div className="d-flex align-items-center flex-wrap">
                                {task.dueDate && (
                                  <small className="text-muted me-2">
                                    <i className="bi bi-calendar-event"></i> Due: {new Date(task.dueDate).toLocaleDateString()}
                                  </small>
                                )}
                                {task.personName && (
                                  <small className="text-muted me-2">
                                    <i className="bi bi-person"></i> {task.personName}
                                  </small>
                                )}
                                {task.completed && <span className="badge bg-success">Completed</span>}
                              </div>
                            </div>
                            <div className="btn-group">
                              {canComplete && !task.completed && (
                                <button className="btn btn-sm btn-success" onClick={() => handleComplete(task)}>
                                  Complete
                                </button>
                              )}
                              {canEditDelete && (
                                <>
                                  <button className="btn btn-sm btn-primary" onClick={() => handleEdit(task)}>
                                    Edit
                                  </button>
                                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(task)}>
                                    Delete
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Task;





