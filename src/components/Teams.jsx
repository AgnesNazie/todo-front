import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import TeamsForm from "./TeamsForm";
import { getAllPersons, createPerson, deletePerson } from "../services/personService";
import TaskService from "../services/taskService";
import { useAuth } from "../context/AuthContext";
import "./Teams.css";

const Teams = () => {
  const { user, isAdmin } = useAuth();
  const [members, setMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch members
  const fetchMembers = async () => {
    try {
      const data = await getAllPersons();
      setMembers(data);
    } catch (err) {
      setError("Failed to fetch members: " + err.message);
    }
  };

  // Fetch all tasks
  const fetchTasks = async () => {
    try {
      const tasksData = await TaskService.getTasks();
      setTasks(tasksData);
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
    }
  };

  useEffect(() => {
    if (user && isAdmin()) {
      fetchMembers();
      fetchTasks();
      setLoading(false);
    }
  }, [user]);

  const handleCreate = async (newMember) => {
    try {
      const created = await createPerson(newMember);
      setMembers((prev) => [...prev, created]);
    } catch (err) {
      setError("Failed to create member: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deletePerson(id);
      setMembers((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      setError("Failed to delete member: " + err.message);
    }
  };

  // Calculate task stats per member dynamically
  const getTaskStats = (memberId) => {
    const memberTasks = tasks.filter((t) => t.personId === memberId);
    const totalTasks = memberTasks.length;
    const completed = memberTasks.filter((t) => t.completed).length;
    const overdue = memberTasks.filter((t) => !t.completed && new Date(t.dueDate) < new Date()).length;
    return { totalTasks, completed, overdue };
  };

  if (!user || !isAdmin()) return <p>Access denied. Admins only.</p>;

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Header title="Teams Management" />
        {error && <p className="error">{error}</p>}

        <TeamsForm onCreate={handleCreate} />

        {loading ? (
          <p>Loading members...</p>
        ) : (
          <div className="members-grid">
            {members.map((member) => {
              const stats = getTaskStats(member.id);
              return (
                <div key={member.id} className="member-card">
                  <h3>{member.name}</h3>
                  <p>{member.email}</p>

                  <div className="task-stats">
                    <p>Total Tasks: {stats.totalTasks}</p>
                    <p>Completed: {stats.completed}</p>
                    <p>Overdue: {stats.overdue}</p>
                  </div>

                  <div className="progress-bar">
                    <div
                      className="completed-bar"
                      style={{ width: `${(stats.completed / (stats.totalTasks || 1)) * 100}%` }}
                    ></div>
                    <div
                      className="overdue-bar"
                      style={{ width: `${(stats.overdue / (stats.totalTasks || 1)) * 100}%` }}
                    ></div>
                  </div>

                  <button onClick={() => handleDelete(member.id)}>Delete</button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Teams;

