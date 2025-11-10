import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function CRUDPage() {
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Form state for create
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  const navigate = useNavigate();

  useEffect(() => { fetchTips(); }, []);

  const fetchTips = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:4000/api/tips`);
      const data = await res.json();
      if (data.success) setTips(data.tips || []);
      else setMessage('Failed to load tips');
    } catch (err) {
      setMessage('Error fetching tips');
    } finally {
      setLoading(false);
    }
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setMessage('No authentication token found. Please log in again.');
      return {};
    }
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setMessage('');
    if (title.trim().length < 3) {
      setMessage('Title must be at least 3 characters');
      return;
    }
    if (content.trim().length < 10) {
      setMessage('Content must be at least 10 characters');
      return;
    }
    try {
      const res = await fetch(`http://localhost:4000/api/tips`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ title: title.trim(), content: content.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Created');
        setTitle(''); setContent('');
        fetchTips();
      } else setMessage(data.message || 'Create failed');
    } catch (err) {
      setMessage('Error creating tip');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this tip?')) return;
    setMessage('');
    try {
      const res = await fetch(`http://localhost:4000/api/tips/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (data.success) { setMessage('Deleted'); fetchTips(); }
      else setMessage(data.message || 'Delete failed');
    } catch (err) {
      setMessage('Error deleting tip');
    }
  };

  const handleEdit = (tip) => {
    setEditingId(tip._id);
    setEditTitle(tip.title);
    setEditContent(tip.content);
  };

  const handleSaveEdit = async () => {
    if (!editTitle.trim() || !editContent.trim()) {
      setMessage('Title and content are required');
      return;
    }
    try {
      const res = await fetch(`http://localhost:4000/api/tips/${editingId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ title: editTitle.trim(), content: editContent.trim() })
      });
      const data = await res.json();
      if (data.success) { 
        setMessage('Updated'); 
        setEditingId(null);
        fetchTips(); 
      }
      else setMessage(data.message || 'Update failed');
    } catch (err) {
      setMessage('Error updating tip');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
    setEditContent('');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="crud-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>CRUD — Manage Safety Tips</h2>
        <button className="logout-btn" onClick={handleLogout}>
          <i className="bi bi-box-arrow-right"></i> Logout
        </button>
      </div>

      <form onSubmit={handleCreate} className="crud-create">
        <h3>Create Tip</h3>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" required />
        <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Content" required />
        <button type="submit">Create</button>
      </form>

      {message && <p className="crud-message">{message}</p>}

      <h3>Existing Tips</h3>
      {loading ? <p>Loading...</p> : (
        <ul className="tips-list">
          {tips.map(t => (
            <li key={t._id} className="tip-item">
              {editingId === t._id ? (
                <div className="edit-form">
                  <input 
                    value={editTitle} 
                    onChange={e => setEditTitle(e.target.value)} 
                    placeholder="Title" 
                    required 
                  />
                  <textarea 
                    value={editContent} 
                    onChange={e => setEditContent(e.target.value)} 
                    placeholder="Content" 
                    required 
                  />
                  <div className="edit-actions">
                    <button className="save-btn" onClick={handleSaveEdit}>Save</button>
                    <button className="cancel-btn" onClick={handleCancelEdit}>Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <h4>{t.title}</h4>
                  <p>{t.content}</p>
                  <small>{new Date(t.createdAt).toLocaleString()}</small>
                  <div className="crud-actions">
                    <button className="edit-btn" onClick={() => handleEdit(t)}><i className="bi bi-pencil-square"></i></button>
                    <button className="delete-btn" onClick={() => handleDelete(t._id)}><i className="bi bi-trash3"></i></button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default CRUDPage;
