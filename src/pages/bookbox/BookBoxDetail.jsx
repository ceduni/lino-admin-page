import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { tokenService, bookboxesAPI } from '../../services/api'
import logo from '../../assets/logo.png'
import '../MainPage/SubPage.css'
import './BookBoxDetail.css'

function BookBoxDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [bookBox, setBookBox] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchBookBox = async () => {
      try {
        setIsLoading(true)
        const data = await bookboxesAPI.getBookBox(id)
        setBookBox(data)
      } catch (err) {
        setError(err.message || 'Failed to load book box details')
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      fetchBookBox()
    }
  }, [id])

  const handleLogout = () => {
    tokenService.removeToken()
    navigate('/')
  }

  const handleBackToMain = () => {
    navigate('/main')
  }

  const handleUpdateBookBox = () => {
    navigate(`/update-book-box/${id}`)
  }

  const handleViewStats = () => {
    navigate(`/book-box/${id}/stats`)
  }

  if (isLoading) {
    return (
      <div className="subpage-container">
        <header className="subpage-header">
          <div className="header-content">
            <div className="header-left">
              <img src={logo} alt="Lino Logo" className="header-logo" />
              <h1 className="subpage-title">Loading...</h1>
            </div>
            <div className="header-actions">
              <button onClick={handleBackToMain} className="back-button">
                ← Back to Main
              </button>
              <button onClick={handleLogout} className="logout-button">
                Logout
              </button>
            </div>
          </div>
        </header>
        <main className="subpage-main">
          <div className="subpage-content">
            <div className="loading-section">
              <p>Loading book box details...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="subpage-container">
        <header className="subpage-header">
          <div className="header-content">
            <div className="header-left">
              <img src={logo} alt="Lino Logo" className="header-logo" />
              <h1 className="subpage-title">Error</h1>
            </div>
            <div className="header-actions">
              <button onClick={handleBackToMain} className="back-button">
                ← Back to Main
              </button>
              <button onClick={handleLogout} className="logout-button">
                Logout
              </button>
            </div>
          </div>
        </header>
        <main className="subpage-main">
          <div className="subpage-content">
            <div className="error-message">{error}</div>
          </div>
        </main>
      </div>
    )
  }

  if (!bookBox) {
    return null
  }

  return (
    <div className="subpage-container">
      <header className="subpage-header">
        <div className="header-content">
          <div className="header-left">
            <img src={logo} alt="Lino Logo" className="header-logo" />
            <h1 className="subpage-title">{bookBox.name}</h1>
          </div>
          <div className="header-actions">
            <button onClick={handleBackToMain} className="back-button">
              ← Back to Main
            </button>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="subpage-main">
        <div className="subpage-content">
          <div className="bookbox-detail-container">
            <div className="bookbox-preview-section">
              <div className="bookbox-preview-card">
                {bookBox.image && (
                  <div className="preview-image">
                    <img src={bookBox.image} alt={bookBox.name} />
                  </div>
                )}
                <div className="detail-info">
                  <h2>{bookBox.name}</h2>
                  {bookBox.infoText && (
                    <p className="info-text">{bookBox.infoText}</p>
                  )}
                    <div className="bookbox-meta">
                      <div className="meta-item">
                        <span className="meta-label">Books:</span>
                        <span className="meta-value">{bookBox.bookCount || 0}</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-label">Location:</span>
                        <span className="meta-value">
                          {bookBox.latitude?.toFixed(4)}, {bookBox.longitude?.toFixed(4)}
                        </span>
                      </div>
                      {bookBox.owner && (
                        <div className="meta-item">
                          <span className="meta-label">Owner:</span>
                          <span className="meta-value">{bookBox.owner}</span>
                        </div>
                      )}
                      <div className="meta-item">
                        <span className="meta-label">Status:</span>
                        <span className={`meta-value status-${bookBox.isActive ? 'active' : 'inactive'}`}>
                          {bookBox.isActive ? '🟢 Active' : '🔴 Inactive'}
                        </span>
                      </div>
                    </div>
                </div>
              </div>
            </div>

            <div className="action-options">
              <h3>What would you like to do?</h3>
              <div className="option-cards">
                <div className="option-card" onClick={handleUpdateBookBox}>
                  <div className="option-icon">⚙️</div>
                  <h4>Update Book Box</h4>
                  <p>Modify the book box information, location, image, and settings</p>
                  <button className="option-button">Update</button>
                </div>
                
                <div className="option-card" onClick={handleViewStats}>
                  <div className="option-icon">📊</div>
                  <h4>View Book Box Stats</h4>
                  <p>View detailed statistics and analytics for this book box</p>
                  <button className="option-button">View Stats</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default BookBoxDetail
