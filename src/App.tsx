import React from 'react'
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { LoginScreen } from './presentation/screens/Login/LoginScreen'
import { AdminDashboard } from './presentation/screens/AdminDashboard/AdminDashboard'

import { AdminCreateClass } from './presentation/screens/AdminCreateClass/AdminCreateClass'
import { AdminCourseRegistrationDetails } from './presentation/screens/AdminCourseRegistrationDetails/AdminCourseRegistrationDetails'
import { StudentDashboard } from './presentation/screens/StudentDashboard/StudentDashboard'
import { Curriculum } from './presentation/screens/Curriculum/Curriculum'

function App(): JSX.Element {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/edit" element={<AdminCreateClass />} />
        <Route path="/admin/create-class" element={<AdminCreateClass />} />
        <Route path="/admin/program-registration-details" element={<AdminCourseRegistrationDetails />} />
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/student/curriculum" element={<Curriculum />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  )
}

export default App
