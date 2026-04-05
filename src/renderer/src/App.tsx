import React from 'react'
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { LoginScreen } from './presentation/screens/Login/LoginScreen'
import { AdminDashboard } from './presentation/screens/AdminDashboard/AdminDashboard'
import { AdminEditClass } from './presentation/screens/AdminEditClass/AdminEditClass'
import { StudentDashboard } from './presentation/screens/StudentDashboard/StudentDashboard'

function App(): JSX.Element {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/edit" element={<AdminEditClass />} />
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  )
}

export default App
