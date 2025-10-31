import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function DeleteAdmin() {
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');

  const handleDelete = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
  const res = await fetch('http://localhost:4000/delete-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Admin deleted successfully');
        setUsername('');
      } else {
        setMessage(data.message || 'Delete failed');
      }
    } catch (err) {
      setMessage('Error deleting admin');
    }
  };

  return (
    <div className="delete-bg">
      <div className="auth-container">
        <h2>Delete Admin</h2>
        <form className="auth-form" onSubmit={handleDelete}>
          <div className="form-group">
            <label>Username</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} required autoComplete="off" />
          </div>
          <button className="auth-btn" type="submit">Delete Admin</button>
        </form>
        {message && <p className="auth-message">{message}</p>}
        <div className="auth-link">
          <Link to="/">Go to Home</Link>
        </div>
      </div>
    </div>
  );
}

export default DeleteAdmin;
