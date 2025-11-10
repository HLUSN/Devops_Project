// frontend/src/App.js
import "./App.css";
import Login from './Login';
import Signup from './Signup';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Tips from './Tips';
import CRUDPage from './CRUDPage';
import TipDetail from './TipDetail';
import AdminPanel from './AdminPanel';
import DeleteAdmin from './DeleteAdmin';
import React, { useEffect } from "react";

function App() {
  const fetchData = async () => {
  const res = await fetch("http://localhost:4000/");
    console.log(res);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="app-container">
      <Router>
        <div className="page-content">
          <Routes>
            <Route path="/" element={
              <div className="home-bg">
                <div className="home-card">
                  <h2 className="home-title">Welcome to the Admin Portal</h2>
                  <p className="home-desc">Manage admin accounts with ease.</p>
                  <div className="home-links">
                    <a className="home-btn" href="/tips">View Tips</a>
                    <a className="home-btn" href="/login">Login</a>
                    <a className="home-btn" href="/signup">Signup</a>
                    <a className="home-btn" href="/delete-admin">Delete Admin</a>
                  </div>
                </div>
              </div>
            } />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/tips" element={<Tips />} />
            <Route path="/tips/:id" element={<TipDetail />} />
            <Route path="/crud" element={<CRUDPage />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/delete-admin" element={<DeleteAdmin />} />
          </Routes>
        </div>
      </Router>
    </div>
  );
}

export default App;