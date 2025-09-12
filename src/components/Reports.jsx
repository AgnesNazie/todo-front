import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useAuth } from "../context/AuthContext";
import TaskService from "../services/taskService";
import { getAllPersons } from "../services/personService";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import "./Reports.css";

const COLORS = ["#4e73df", "#1cc88a", "#f6c23e", "#e74a3b", "#36b9cc"];

const Reports = () => {
  const { user, isAdmin } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      const tasksData = await TaskService.getTasks();
      const usersData = await getAllPersons();
      setTasks(tasksData);
      setUsers(usersData);
    } catch (err) {
      setError("Failed to fetch data: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && isAdmin()) {
      fetchData();
    }
  }, [user]);

  if (!user || !isAdmin()) return <p>Access denied. Admins only.</p>;

  // Calculate stats
  const completedTasks = tasks.filter(t => t.completed).length;
  const pendingTasks = tasks.filter(t => !t.completed).length;
  const overdueTasks = tasks.filter(t => !t.completed && new Date(t.dueDate) < new Date()).length;

  // Prepare chart data
  const tasksPerUser = users.map(u => {
    const userTasks = tasks.filter(t => t.personId === u.id);
    return {
      name: u.name,
      total: userTasks.length,
      completed: userTasks.filter(t => t.completed).length,
      pending: userTasks.filter(t => !t.completed).length,
    };
  });

  const taskStatusData = [
    { name: "Completed", value: completedTasks },
    { name: "Pending", value: pendingTasks },
    { name: "Overdue", value: overdueTasks },
  ];

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Header title="Reports" />

        {error && <p className="error">{error}</p>}
        {loading ? (
          <p>Loading data...</p>
        ) : (
          <>
            {/* Stat Cards */}
            <div className="reports-cards">
              <div className="card total-tasks" style={{ backgroundColor: "#4e73df", color: "#fff" }}>
                <h3>Total Tasks</h3>
                <p>{tasks.length}</p>
              </div>
              <div className="card total-users" style={{ backgroundColor: "#1cc88a", color: "#fff" }}>
                <h3>Total Users</h3>
                <p>{users.length}</p>
              </div>
              <div className="card pending-tasks" style={{ backgroundColor: "#f6c23e", color: "#fff" }}>
                <h3>Pending Tasks</h3>
                <p>{pendingTasks}</p>
              </div>
              <div className="card overdue-tasks" style={{ backgroundColor: "#e74a3b", color: "#fff" }}>
                <h3>Overdue Tasks</h3>
                <p>{overdueTasks}</p>
              </div>
            </div>

            {/* Progress Bars */}
            <div className="progress-section">
              <h2>Overall Task Progress</h2>
              <div className="progress-bar-container">
                <p>Completed Tasks: {completedTasks} / {tasks.length}</p>
                <div className="progress">
                  <div
                    className="progress-bar bg-success"
                    role="progressbar"
                    style={{ width: `${(completedTasks / (tasks.length || 1)) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div className="progress-bar-container">
                <p>Pending Tasks: {pendingTasks} / {tasks.length}</p>
                <div className="progress">
                  <div
                    className="progress-bar bg-warning"
                    role="progressbar"
                    style={{ width: `${(pendingTasks / (tasks.length || 1)) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div className="progress-bar-container">
                <p>Overdue Tasks: {overdueTasks} / {tasks.length}</p>
                <div className="progress">
                  <div
                    className="progress-bar bg-danger"
                    role="progressbar"
                    style={{ width: `${(overdueTasks / (tasks.length || 1)) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="charts-section">
              <h2>Tasks Per User</h2>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={tasksPerUser}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="completed" fill="#1cc88a" />
                  <Bar dataKey="pending" fill="#f6c23e" />
                </BarChart>
              </ResponsiveContainer>

              <h2>Task Status Distribution</h2>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={taskStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={150}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {taskStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Reports;



