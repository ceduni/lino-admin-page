import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { tokenService, bookboxesAPI } from '../../services/api'
import logo from '../../assets/logo.png'
import './SubPage.css'

function MainPage() {
  const navigate = useNavigate()
  const [searchFilters, setSearchFilters] = useState({
    q: '',
    cls: 'by name',
    asc: true
  })
  const [bookBoxes, setBookBoxes] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Load initial book boxes on page load
    handleInitialLoad()
  }, [])

  const handleInitialLoad = async () => {
    setIsLoading(true)
    try {
      // Load all book boxes initially
      const response = await bookboxesAPI.searchBookBoxes({
        q: '',
        cls: 'by name',
        asc: true
      })
      setBookBoxes(response.bookboxes || response)
    } catch (err) {
      setError(err.message)
      console.error('Error loading book boxes:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    tokenService.removeToken()
    navigate('/')
  }

  const handleCreateBookBox = () => {
    navigate('/register-book-box')
  }

  const handleLookupTransactions = () => {
    navigate('/lookup-transactions')
  }

  const handleSearchInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setSearchFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const filters = {
        q: searchFilters.q,
        cls: searchFilters.cls,
        asc: searchFilters.asc
      }

      const response = await bookboxesAPI.searchBookBoxes(filters)
      setBookBoxes(response.bookboxes || response)
    } catch (err) {
      setError(err.message)
      console.error('Error searching book boxes:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBookBoxClick = (bookBox) => {
    navigate(`/book-box/${bookBox._id}`)
  }

  return (
    <div className="subpage-container">
      <header className="subpage-header">
        <div className="header-content">
          <div className="header-left">
            <img src={logo} alt="Lino Logo" className="header-logo" />
            <h1 className="subpage-title">Lino Admin - Book Boxes</h1>
          </div>
          <div className="header-actions">
            <button onClick={handleCreateBookBox} className="create-button">
              + Create Book Box
            </button>
            <button onClick={handleLookupTransactions} className="transactions-button">
              📊 Transactions
            </button>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="subpage-main">
        <div className="subpage-content">
          {error && <div className="error-message">{error}</div>}
          
          {/* Search Form */}
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-section">
              <h3>Search Book Boxes</h3>
              
              <div className="search-row">
                <div className="form-group">
                  <label htmlFor="kw">Search Query</label>
                  <input
                    type="text"
                    id="q"
                    name="q"
                    value={searchFilters.q}
                    onChange={handleSearchInputChange}
                    placeholder="Enter search keywords..."
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="cls">Search By</label>
                  <select
                    id="cls"
                    name="cls"
                    value={searchFilters.cls}
                    onChange={handleSearchInputChange}
                  >
                    <option value="by name">By Name</option>
                    <option value="by number of books">By Number of Books</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="asc">Sort Order</label>
                  <select
                    id="asc"
                    name="asc"
                    value={searchFilters.asc}
                    onChange={handleSearchInputChange}
                  >
                    <option value={true}>Ascending</option>
                    <option value={false}>Descending</option>
                  </select>
                </div>
                
                <button type="submit" className="search-button" disabled={isLoading}>
                  {isLoading ? 'Searching...' : 'Search'}
                </button>
              </div>
            </div>
          </form>

          {/* Book Boxes Grid */}
          {isLoading ? (
            <div className="loading-section">
              <p>Loading book boxes...</p>
            </div>
          ) : bookBoxes.length > 0 ? (
            <div className="results-section">
              <h3>Your Book Boxes ({bookBoxes.length} found)</h3>
              <div className="bookbox-grid">
                {bookBoxes.map((bookBox) => (
                  <div 
                    key={bookBox._id} 
                    className="bookbox-card"
                    onClick={() => handleBookBoxClick(bookBox)}
                  >
                    {bookBox.image && (
                      <img src={bookBox.image} alt={bookBox.name} className="bookbox-image" />
                    )}
                    <div className="bookbox-info">
                      <h4>{bookBox.name}</h4>
                      {bookBox.infoText && <p className="bookbox-description">{bookBox.infoText}</p>}
                      <div className="bookbox-meta">
                        <span>Books: {bookBox.bookCount || 0}</span>
                        <span>Location: {bookBox.latitude?.toFixed(4)}, {bookBox.longitude?.toFixed(4)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="no-results">
              <p>No book boxes found. Try adjusting your search criteria or create a new book box.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default MainPage
