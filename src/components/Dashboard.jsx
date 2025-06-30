import { useNavigate } from 'react-router-dom'
import { tokenService } from '../services/api'
import logo from '../assets/logo.png'
import './Dashboard.css'

function Dashboard() {
  const navigate = useNavigate()

  const handleLogout = () => {
    tokenService.removeToken()
    navigate('/')
  }

  const handleRegisterBookBox = () => {
    navigate('/dashboard/register-book-box')
  }

  const handleLookupTransactions = () => {
    navigate('/dashboard/lookup-transactions')
  }

  const handleManageBookBoxes = () => {
    navigate('/dashboard/manage-book-boxes')
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <img src={logo} alt="Lino Logo" className="header-logo" />
            <h1 className="dashboard-title">Lino Admin Dashboard</h1>
          </div>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-content">
          <h2 className="welcome-title">Welcome to the Admin Dashboard</h2>
          <p className="welcome-subtitle">Choose an action below to get started</p>
          
          <div className="action-cards">
            <div className="action-card" onClick={handleRegisterBookBox}>
              <div className="card-icon">📚</div>
              <h3 className="card-title">Register New Book Box</h3>
              <p className="card-description">Add a new book box to the system</p>
              <button className="card-button">Get Started</button>
            </div>

            <div className="action-card" onClick={handleManageBookBoxes}>
              <div className="card-icon">⚙️</div>
              <h3 className="card-title">Manage Book Boxes</h3>
              <p className="card-description">Search, update, and manage existing book boxes</p>
              <button className="card-button">Manage Now</button>
            </div>

            <div className="action-card" onClick={handleLookupTransactions}>
              <div className="card-icon">🔍</div>
              <h3 className="card-title">Lookup Book Transactions</h3>
              <p className="card-description">Search and view book transaction history</p>
              <button className="card-button">Search Now</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard
