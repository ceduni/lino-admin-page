import { useNavigate } from 'react-router-dom'
import { tokenService } from '../services/api'
import logo from '../assets/logo.png'
import './SubPage.css'

function RegisterBookBox() {
  const navigate = useNavigate()

  const handleLogout = () => {
    tokenService.removeToken()
    navigate('/')
  }

  const handleBackToDashboard = () => {
    navigate('/dashboard')
  }

  return (
    <div className="subpage-container">
      <header className="subpage-header">
        <div className="header-content">
          <div className="header-left">
            <img src={logo} alt="Lino Logo" className="header-logo" />
            <h1 className="subpage-title">Register New Book Box</h1>
          </div>
          <div className="header-actions">
            <button onClick={handleBackToDashboard} className="back-button">
              ← Back to Dashboard
            </button>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="subpage-main">
        <div className="subpage-content">
          <div className="placeholder-content">
            <div className="placeholder-icon">📚</div>
            <h2 className="placeholder-title">Register New Book Box</h2>
            <p className="placeholder-description">
              This page will contain the form to register a new book box in the system.
              The implementation will be added later.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default RegisterBookBox
