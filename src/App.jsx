import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Home from './pages/Home';
import Listing from './pages/Listing';
import UserVideos from './pages/UserVideos';

function PrivateRoute({ children }) {
  const token = sessionStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />
        <Route
          path="/listing"
          element={
            <PrivateRoute>
              <Listing />
            </PrivateRoute>
          }
        />
        <Route
          path="/user-videos/:userName"
          element={
            <PrivateRoute>
              <UserVideos />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
