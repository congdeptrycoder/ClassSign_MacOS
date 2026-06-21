import React, { useState, useCallback } from 'react'
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { LoginScreen } from './presentation/screens/Login/LoginScreen'
import { AdminDashboard } from './presentation/screens/AdminDashboard/AdminDashboard'
import { AdminCreateClass } from './presentation/screens/AdminCreateClass/AdminCreateClass'
import { AdminCourseRegistrationDetails } from './presentation/screens/AdminCourseRegistrationDetails/AdminCourseRegistrationDetails'
import { StudentDashboard } from './presentation/screens/StudentDashboard/StudentDashboard'
import { Curriculum } from './presentation/screens/Curriculum/Curriculum'
import { AboutModal } from './presentation/components/AboutModal/AboutModal'
import { useAppMenuViewModel } from './interface-adapters/viewmodels/AppMenu/useAppMenuViewModel'

// ─────────────────────────────────────────────────────────────────────────────
// Inner component that must be rendered *inside* <Router> so that
// useNavigate (used by useAppMenuViewModel) works correctly.
// ─────────────────────────────────────────────────────────────────────────────
function AppRoutes(): React.ReactElement {
    const [isAboutOpen, setIsAboutOpen] = useState(false)

    const handleShowAbout = useCallback(() => setIsAboutOpen(true), [])
    const handleCloseAbout = useCallback(() => setIsAboutOpen(false), [])

    // Connect native Electron menu events to the React UI
    useAppMenuViewModel({ onShowAbout: handleShowAbout })

    return (
        <>
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

            {isAboutOpen && <AboutModal onClose={handleCloseAbout} />}
        </>
    )
}

function App(): React.ReactElement {
    return (
        <Router>
            <AppRoutes />
        </Router>
    )
}

export default App
