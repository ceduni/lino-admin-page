import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiLogOut, FiShield } from 'react-icons/fi'
import { tokenService, authAPI } from '../../../services/api'
import logo from '../../../assets/logo.png'
import './AdminHeader.css'

function AdminHeader() {
  const navigate = useNavigate()
  const [currentUser, setCurrentUser] = useState(null)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const user = await authAPI.getCurrentUser()
        setCurrentUser(user)
        setIsSuperAdmin(user.user.username === import.meta.env.VITE_SUPER_ADMIN_USERNAME)
      } catch (error) {
        console.error('Failed to fetch current user:', error)
      }
    }

    fetchCurrentUser()
  }, [])

  const handleLogout = () => {
    tokenService.removeToken()
    navigate('/login')
  }

  const handleBackToMain = () => {
    navigate('/main')
  }

  const handleGoToSuperAdmin = () => {
    navigate('/super-admin')
  }

  return (
    <header className="admin-header">
      <div className="header-content">
        <div className="header-left">
          <img src={logo} alt="Lino Logo" className="header-logo" />
          <h1 className="header-title" onClick={handleBackToMain}>Admin Dashboard</h1>
        </div>
        <div className="header-actions">
          {isSuperAdmin && (
            <button onClick={handleGoToSuperAdmin} className="super-admin-button">
              <FiShield className="super-admin-icon" />
              <span>Super Admin</span>
            </button>
          )}
          <button onClick={handleLogout} className="logout-button">
            <FiLogOut className="logout-icon" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  )
}

export default AdminHeader
