import React, { useState, useEffect } from "react";
import "./Dashboard.css";
import Sidebar from "./Sidebar";
import Header from "./Header.jsx";
import { useAuth } from "../context/AuthContext";
import TaskService from "../services/taskService";

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [expandedSection, setExpandedSection] = useState(null);

  const fetchTasks = async () => {
    try {
      const data = await TaskService.getTasks();
      setTasks(Array.isArray(data) ? data : [data]);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await TaskService.getPersons();
      setUsers(data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  useEffect(() => {
    if (user && isAdmin()) {
      fetchTasks();
      fetchUsers();
    }
  }, [user]);

  const today = new Date();
  const pendingTasks = tasks.filter((t) => !t.completed && new Date(t.dueDate) >= today);
  const inProgressTasks = tasks.filter((t) => !t.completed && t.status === "in-progress");
  const completedTasks = tasks.filter((t) => t.completed);
  const overdueTasks = tasks.filter((t) => !t.completed && new Date(t.dueDate) < today);
  const recentTasks = [...tasks].sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate)).slice(0, 5);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "pending":
        return "bg-warning text-dark";
      case "in-progress":
        return "bg-primary";
      case "completed":
        return "bg-success";
      default:
        return "bg-secondary";
    }
  };

  const TaskTable = ({ tasks }) => (
    <div className="table-responsive mt-2">
      <table className="table table-hover align-middle mb-0">
        <thead className="table-light">
          <tr>
            <th>#</th>
            <th>Task</th>
            <th>Assignee</th>
            <th>Due Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task, index) => (
            <tr key={task.id}>
              <td>{index + 1}</td>
              <td>{task.title}</td>
              <td>{task.personName || "Unassigned"}</td>
              <td>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "-"}</td>
              <td>
                <span className={`badge ${getStatusBadgeClass(task.status || (task.completed ? "completed" : "pending"))}`}>
                  {task.status ? task.status.charAt(0).toUpperCase() + task.status.slice(1) : task.completed ? "Completed" : "Pending"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const UserTable = ({ users }) => (
    <div className="table-responsive mt-2">
      <table className="table table-hover align-middle mb-0">
        <thead className="table-light">
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Email</th>
            <th>Tasks Assigned</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u, index) => (
            <tr key={u.id}>
              <td>{index + 1}</td>
              <td>{u.name}</td>
              <td>{u.email || "-"}</td>
              <td>{tasks.filter((t) => t.personId === u.id).length}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const handleCardClick = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="dashboard-layout">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <main className="dashboard-main">
        <Header title="Dashboard" subtitle="Welcome back! Here's your tasks overview" onToggleSidebar={() => setIsSidebarOpen(true)} />

        {isAdmin() && (
          <div className="dashboard-content">
            <div className="stats-grid">
              <div className="stat-card" onClick={() => handleCardClick("pending")}>
                <div className="stat-icon pending">
                  <i className="bi bi-hourglass-split"></i>
                </div>
                <div className="stat-info">
                  <h3>Pending</h3>
                  <p className="stat-number">{pendingTasks.length}</p>
                </div>
              </div>

              <div className="stat-card" onClick={() => handleCardClick("inProgress")}>
                <div className="stat-icon in-progress">
                  <i className="bi bi-arrow-clockwise"></i>
                </div>
                <div className="stat-info">
                  <h3>In Progress</h3>
                  <p className="stat-number">{inProgressTasks.length}</p>
                </div>
              </div>

              <div className="stat-card" onClick={() => handleCardClick("completed")}>
                <div className="stat-icon completed">
                  <i className="bi bi-check2-circle"></i>
                </div>
                <div className="stat-info">
                  <h3>Completed</h3>
                  <p className="stat-number">{completedTasks.length}</p>
                </div>
              </div>

              <div className="stat-card" onClick={() => handleCardClick("overdue")}>
                <div className="stat-icon overdue">
                  <i className="bi bi-hourglass-split"></i>
                </div>
                <div className="stat-info">
                  <h3>Overdue</h3>
                  <p className="stat-number">{overdueTasks.length}</p>
                </div>
              </div>

              <div className="stat-card" onClick={() => handleCardClick("users")}>
                <div className="stat-icon info">
                  <i className="bi bi-people"></i>
                </div>
                <div className="stat-info">
                  <h3>Users</h3>
                  <p className="stat-number">{users.length}</p>
                </div>
              </div>
            </div>

            {/* Inline Expanded Section */}
            {expandedSection === "pending" && <TaskTable tasks={pendingTasks} />}
            {expandedSection === "inProgress" && <TaskTable tasks={inProgressTasks} />}
            {expandedSection === "completed" && <TaskTable tasks={completedTasks} />}
            {expandedSection === "overdue" && <TaskTable tasks={overdueTasks} />}
            {expandedSection === "users" && <UserTable users={users} />}

            {/* Recent Activities */}
            <div className="tasks-grid mt-4">
              <h2>Recent Activities</h2>
              <TaskTable tasks={recentTasks} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;



