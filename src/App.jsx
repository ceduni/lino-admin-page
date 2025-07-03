import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { tokenService } from './services/api'
import Login from './components/Login'
import MainPage from './components/MainPage'
import BookBoxDetail from './components/BookBoxDetail'
import RegisterBookBox from './components/RegisterBookBox'
import ManageBookBoxUpdate from './components/ManageBookBoxUpdate'
import LookupTransactions from './components/LookupTransactions'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  // If user is already authenticated, redirect to main page
  const isAuthenticated = tokenService.isAuthenticated()

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={
            isAuthenticated ? <Navigate to="/main" replace /> : <Login />
          } 
        />
        <Route 
          path="/main" 
          element={
            <ProtectedRoute>
              <MainPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/book-box/:id" 
          element={
            <ProtectedRoute>
              <BookBoxDetail />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/register-book-box" 
          element={
            <ProtectedRoute>
              <RegisterBookBox />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/manage-book-boxes/:id" 
          element={
            <ProtectedRoute>
              <ManageBookBoxUpdate />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/lookup-transactions" 
          element={
            <ProtectedRoute>
              <LookupTransactions />
            </ProtectedRoute>
          } 
        />
        {/* Catch all route - redirect to login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
