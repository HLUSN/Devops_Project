import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function Tips() {
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTips = async () => {
      try {
        const res = await fetch('http://localhost:4000/api/tips');
        const data = await res.json();
        if (data.success) setTips(data.tips || []);
        else setError('Failed to load tips');
      } catch (err) {
        setError('Error fetching tips');
      } finally {
        setLoading(false);
      }
    };
    fetchTips();
  }, []);

  if (loading) return <div className="tips-container">Loading tips...</div>;
  if (error) return <div className="tips-container">{error}</div>;

  return (
    <div className="tips-container">
      <h2>Cyber Safe Guide — Safety Tips</h2>
      {tips.length === 0 && <p>No tips yet.</p>}
      <ul className="tips-list">
        {tips.map(t => (
          <li key={t._id} className="tip-item">
            <h3><Link to={`/tips/${t._id}`}>{t.title}</Link></h3>
            <p>{t.content}</p>
            <small>Posted: {new Date(t.createdAt).toLocaleString()}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Tips;
