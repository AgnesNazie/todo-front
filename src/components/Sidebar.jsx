
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Sidebar.css';
import { useAuth } from "../context/AuthContext.jsx";

const Sidebar = ({isOpen, onClose}) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout, hasRole } = useAuth();

    const navItems = [
        {
            icon: "bi-grid",
            text: "Dashboard",
            path: "/dashboard",
            roles: ['ROLE_ADMIN'] // Only show for admin
        },
        {
            icon: "bi-list-task",
            text: "Tasks",
            path: "/dashboard/tasks",
            roles: ['ROLE_USER', 'ROLE_ADMIN'] // Show for both user and admin
        },
        {
            icon: "bi-calendar3",
            text: "Calendar",
            path: "/dashboard/calendar",
            roles: ['ROLE_USER', 'ROLE_ADMIN']
        },
        {
            icon: "bi-people",
            text: "Teams",
            path: "/dashboard/teams",
            roles: ['ROLE_ADMIN'] // Only show for admin
        },
        {
            icon: "bi-graph-up",
            text: "Reports",
            path: "/dashboard/reports",
            roles: ['ROLE_ADMIN'] // Only show for admin
        }
    ];

    const handleNavigation = (path) => {
        navigate(path);
        if (typeof onClose === "function") {
            onClose();
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    // Filter navigation items based on user roles
    const filteredNavItems = navItems.filter(item =>
        item.roles.some(role => hasRole(role))
    );

    return (
        <>
            <div className={`sidebar-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}></div>
            <div className={`sidebar ${isOpen ? 'active' : ''}`}>
                <div className="sidebar-content">
                    <div className="sidebar-header">
                        <div className="logo-container">
                            <i className="bi bi-card-checklist"></i>
                            <h4>To-do</h4>
                        </div>
                        <button className="close-sidebar d-md-none" onClick={onClose}>
                            <i className="bi bi-x-lg"></i>
                        </button>
                    </div>

                    <nav className="sidebar-nav">
                        {filteredNavItems.map((item, index) => (
                            <div
                                key={index}
                                className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                                onClick={() => handleNavigation(item.path)}
                                style={{ cursor: 'pointer' }}
                            >
                                <i className={`bi ${item.icon}`}></i>
                                <span>{item.text}</span>
                            </div>
                        ))}
                    </nav>

                    <div className="sidebar-footer">
                        <div className="user-section">
                            <div className="user-avatar">
                                <i className="bi bi-person"></i>
                            </div>
                            <div className="user-info">
                                <h5>{user?.name || 'User'}</h5>
                                <p>{user?.email || ''}</p>
                            </div>
                        </div>
                        <button className="logout-btn" onClick={handleLogout}>
                            <i className="bi bi-box-arrow-right"></i>
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;