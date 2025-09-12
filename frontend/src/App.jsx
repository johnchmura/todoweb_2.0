import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProgressBar from './components/ProgressBar';
import TodoList from './components/TodoList';
import Calendar from './components/Calendar';
import Enter from './pages/Enter';
import './App.css';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="loader"></div>
        <p style={{ marginLeft: '10px' }}>Loading...</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Navbar />
        {user && <ProgressBar />}
        <Routes>
          <Route path="/" element={<TodoList />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/enter" element={<Enter />} />
        </Routes>
        <Toaster />
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;

