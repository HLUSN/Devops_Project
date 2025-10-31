import React, { useState } from 'react';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
  const res = await fetch('http://localhost:4000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Login successful!');
        setUsername('');
        setPassword('');
        // You can redirect or set login state here
      } else {
        setMessage('Invalid credentials');
      }
    } catch (err) {
      setMessage('Error logging in');
    }
  };

  return (
    <div className="login-bg">
      <div className="auth-container">
        <h2>Admin Login</h2>
        <form className="auth-form" onSubmit={handleSubmit} autoComplete="off">
          <div className="form-group">
            <label>Username</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} required autoComplete="off" />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="new-password" />
          </div>
          <button className="auth-btn" type="submit">Login</button>
        </form>
        {message && <p className="auth-message">{message}</p>}
        <div className="auth-link">
          <a href="/signup">Don't have an account? Sign up</a>
        </div>
      </div>
    </div>
  );
}

export default Login;
