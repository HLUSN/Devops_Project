import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function TipDetail() {
  const { id } = useParams();
  const [tip, setTip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTip = async () => {
      try {
        const res = await fetch(`http://localhost:4000/api/tips/${id}`);
        const data = await res.json();
        if (data.success) setTip(data.tip);
        else setError(data.message || 'Tip not found');
      } catch (err) {
        setError('Error fetching tip');
      } finally {
        setLoading(false);
      }
    };
    fetchTip();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="tip-detail">{error}</div>;
  if (!tip) return <div className="tip-detail">No tip found</div>;

  return (
    <div className="tip-detail">
      <h2>{tip.title}</h2>
      <div className="tip-detail-card">
        <p>{tip.content}</p>
      </div>
      <small>Posted: {new Date(tip.createdAt).toLocaleString()}</small>
    </div>
  );
}

export default TipDetail;
