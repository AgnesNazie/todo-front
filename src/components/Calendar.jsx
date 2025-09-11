import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import Sidebar from "./Sidebar";
import Header from "./Header";
import TaskService from "../services/taskService";
import { useAuth } from "../context/AuthContext";
import "./Calendar.css";

const Calendar = () => {
  const { user, isAdmin } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Fetch tasks dynamically
  const fetchTasks = async () => {
    try {
      let data = await TaskService.getTasks();

      if (!Array.isArray(data)) data = [data];

      if (!isAdmin()) {
        // Users see only their own tasks
        data = data.filter((task) => task.personId === user.id);
      }

      setTasks(data);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    }
  };

  useEffect(() => {
    if (user) fetchTasks();
  }, [user]);

  // Convert tasks to FullCalendar events
  const events = tasks.map((task) => ({
    id: task.id,
    title: task.title,
    start: task.dueDate,
    color: task.completed
      ? "#198754" // Green
      : new Date(task.dueDate) < new Date()
      ? "#dc3545" // Red if overdue
      : "#0d6efd", // Blue pending
    extendedProps: {
      description: task.description,
      status: task.completed ? "Completed" : "Pending",
      personName: task.personName,
    },
  }));

  const handleEventClick = (info) => {
    const task = tasks.find((t) => t.id === Number(info.event.id));
    setSelectedTask(task);
  };

  const closeModal = () => setSelectedTask(null);

  return (
    <div className="dashboard-layout">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <main className="dashboard-main">
        <Header
          title="Calendar"
          subtitle="View your tasks and activities"
          onToggleSidebar={() => setIsSidebarOpen(true)}
        />

        <div className="dashboard-content">
          <div className="calendar-container">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek,timeGridDay",
              }}
              events={events}
              eventClick={handleEventClick}
              nowIndicator
              height="auto"
            />

            {/* Modal for task details */}
            {selectedTask && (
              <div className="modal-overlay" onClick={closeModal}>
                <div
                  className="modal-content"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h5>{selectedTask.title}</h5>
                  <p><strong>Description:</strong> {selectedTask.description}</p>
                  <p><strong>Due Date:</strong> {new Date(selectedTask.dueDate).toLocaleString()}</p>
                  <p><strong>Status:</strong> {selectedTask.completed ? "Completed" : "Pending"}</p>
                  <p><strong>Assignee:</strong> {selectedTask.personName || "N/A"}</p>
                  <button className="btn btn-secondary mt-2" onClick={closeModal}>Close</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Calendar;

