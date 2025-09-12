import React, { useState } from "react";


const TeamsForm = ({ onCreate }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("USER");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name || !email || !username || !password || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setError("");

    onCreate({
      name,
      email,
      username,
      password,
      confirmPassword,
      role,
    });

    setName("");
    setEmail("");
    setUsername("");
    setPassword("");
    setConfirmPassword("");
    setRole("USER");
  };

  return (
    <form className="teams-form" onSubmit={handleSubmit}>
      <h2>Add Team Member</h2>
      {error && <p className="error">{error}</p>}

      <div className="form-grid">
        <div className="form-group">
          <label>Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>

        <div className="form-group">
          <label>Username</label>
          <input value={username} onChange={(e) => setUsername(e.target.value)} required />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>

        <div className="form-group">
          <label>Confirm Password</label>
          <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
        </div>

        <div className="form-group">
          <label>Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="USER">User</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
      </div>

      <button type="submit" className="submit-btn">Create Member</button>
    </form>
  );
};

export default TeamsForm;

