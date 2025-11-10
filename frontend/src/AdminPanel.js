import React, { useEffect, useState } from 'react';

function AdminPanel() {
  const [tips, setTips] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [adminKey, setAdminKey] = useState('');

  const fetchTips = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/tips');
      const data = await res.json();
      if (data.success) setTips(data.tips || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTips(); }, []);

  const headersWithKey = () => ({
    'Content-Type': 'application/json',
    'x-admin-key': adminKey,
    'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : undefined
  });

  const handleCreate = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await fetch('/api/tips', {
        method: 'POST',
        headers: headersWithKey(),
        body: JSON.stringify({ title, content })
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Tip created');
        setTitle(''); setContent('');
        fetchTips();
      } else {
        setMessage(data.message || 'Create failed');
      }
    } catch (err) {
      setMessage('Error creating tip');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this tip?')) return;
    setMessage('');
    try {
      const res = await fetch(`/api/tips/${id}`, {
        method: 'DELETE',
        headers: headersWithKey()
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Tip deleted');
        fetchTips();
      } else setMessage(data.message || 'Delete failed');
    } catch (err) {
      setMessage('Error deleting tip');
    }
  };

  const handleUpdate = async (id) => {
    const newTitle = prompt('New title');
    if (newTitle === null) return;
    const newContent = prompt('New content');
    if (newContent === null) return;
    try {
      const res = await fetch(`/api/tips/${id}`, {
        method: 'PUT',
        headers: headersWithKey(),
        body: JSON.stringify({ title: newTitle, content: newContent })
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Tip updated');
        fetchTips();
      } else setMessage(data.message || 'Update failed');
    } catch (err) {
      setMessage('Error updating tip');
    }
  };

  return (
    <div className="admin-panel">
      <h2>Admin Panel — Manage Tips</h2>
      <div className="admin-key">
        <label>Admin Key (for demo): </label>
        <input value={adminKey} onChange={e => setAdminKey(e.target.value)} placeholder="Enter admin key" />
      </div>
      <form onSubmit={handleCreate} className="admin-form">
        <div>
          <label>Title</label>
          <input value={title} onChange={e => setTitle(e.target.value)} required />
        </div>
        <div>
          <label>Content</label>
          <textarea value={content} onChange={e => setContent(e.target.value)} required />
        </div>
        <button type="submit">Create Tip</button>
      </form>
      {message && <p className="admin-message">{message}</p>}

      <h3>Existing Tips</h3>
      {loading ? <p>Loading...</p> : (
        <ul className="tips-list admin-list">
          {tips.map(t => (
            <li key={t._id}>
              <strong>{t.title}</strong>
              <p>{t.content}</p>
              <small>{new Date(t.createdAt).toLocaleString()}</small>
              <div className="admin-actions">
                <button onClick={() => handleUpdate(t._id)}>Edit</button>
                <button onClick={() => handleDelete(t._id)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default AdminPanel;
