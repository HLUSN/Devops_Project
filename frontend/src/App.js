// frontend/src/App.js
import logo from "./logo.svg";
import "./App.css";
import Login from './Login';
import Signup from './Signup';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
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
    <Router>
      <Routes>
        <Route path="/" element={
          <div className="home-bg">
            <div className="home-card">
              <h2 className="home-title">Welcome to the Admin Portal</h2>
              <p className="home-desc">Manage admin accounts with ease.</p>
              <div className="home-links">
                <a className="home-btn" href="/login">Login</a>
                <a className="home-btn" href="/signup">Signup</a>
                <a className="home-btn" href="/delete-admin">Delete Admin</a>
              </div>
            </div>
          </div>
        } />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/delete-admin" element={<DeleteAdmin />} />
      </Routes>
    </Router>
  );
}

export default App;