import React, { useState } from 'react';

function Signup() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
  const res = await fetch('http://localhost:4000/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Signup successful! You can now log in.');
        setUsername('');
        setPassword('');
      } else {
        setMessage(data.message || 'Signup failed');
      }
    } catch (err) {
      setMessage('Error signing up');
    }
  };

  return (
    <div className="signup-bg">
      <div className="auth-container">
        <h2>Admin Signup</h2>
        <form className="auth-form" onSubmit={handleSubmit} autoComplete="off">
          <div className="form-group">
            <label>Username</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} required autoComplete="off" />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="off" />
          </div>
          <button className="auth-btn" type="submit">Sign Up</button>
        </form>
        {message && <p className="auth-message">{message}</p>}
        <div className="auth-link">
          <a href="/login">Already have an account? Log in</a>
        </div>
      </div>
    </div>
  );
}

export default Signup;
