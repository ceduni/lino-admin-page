import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { tokenService, bookboxesAPI, transactionsAPI } from '../services/api'
import TransactionCard from './TransactionCard'
import TransactionGraphs from './TransactionGraphs'
import logo from '../assets/logo.png'
import './SubPage.css'
import './BookBoxDetail.css'

function BookBoxDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [bookBox, setBookBox] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeView, setActiveView] = useState('options') // 'options', 'update', 'stats'
  
  // Transaction search states
  const [transactionFilters, setTransactionFilters] = useState({
    username: '',
    bookTitle: '',
    limit: 50
  })
  const [transactions, setTransactions] = useState([])
  const [transactionLoading, setTransactionLoading] = useState(false)
  const [transactionError, setTransactionError] = useState('')
  const [hasSearchedTransactions, setHasSearchedTransactions] = useState(false)

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
    navigate(`/manage-book-boxes/${id}`)
  }

  const handleViewStats = async () => {
    setActiveView('stats')
    // Load initial transactions for this book box
    await loadBookBoxTransactions()
  }

  const handleBackToOptions = () => {
    setActiveView('options')
    // Reset transaction data when going back
    setTransactions([])
    setTransactionError('')
    setHasSearchedTransactions(false)
    setTransactionFilters({
      username: '',
      bookTitle: '',
      limit: 50
    })
  }

  const loadBookBoxTransactions = async () => {
    if (!bookBox) return
    
    setTransactionLoading(true)
    setTransactionError('')
    setHasSearchedTransactions(true)

    try {
      const searchFilters = {
        bookboxId: bookBox.id,
        limit: transactionFilters.limit
      }

      const data = await transactionsAPI.searchTransactions(searchFilters)
      setTransactions(data.transactions || data || [])
    } catch (err) {
      setTransactionError(err.message || 'Failed to fetch transactions')
      setTransactions([])
    } finally {
      setTransactionLoading(false)
    }
  }

  const handleTransactionInputChange = (e) => {
    const { name, value } = e.target
    setTransactionFilters(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleTransactionSearch = async (e) => {
    e.preventDefault()
    if (!bookBox) return

    setTransactionLoading(true)
    setTransactionError('')
    setHasSearchedTransactions(true)

    try {
      // Build search filters with book box ID preset
      const searchFilters = {
        bookboxId: bookBox.id,
        limit: parseInt(transactionFilters.limit)
      }

      // Add optional filters if provided
      if (transactionFilters.username.trim()) {
        searchFilters.username = transactionFilters.username.trim()
      }
      if (transactionFilters.bookTitle.trim()) {
        searchFilters.bookTitle = transactionFilters.bookTitle.trim()
      }

      const data = await transactionsAPI.searchTransactions(searchFilters)
      setTransactions(data.transactions || data || [])
    } catch (err) {
      setTransactionError(err.message || 'Failed to fetch transactions')
      setTransactions([])
    } finally {
      setTransactionLoading(false)
    }
  }

  const handleClearTransactionFilters = () => {
    setTransactionFilters({
      username: '',
      bookTitle: '',
      limit: 50
    })
    // Reload with just the book box ID
    loadBookBoxTransactions()
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
            {activeView === 'stats' && (
              <button onClick={handleBackToOptions} className="back-button">
                ← Back to Options
              </button>
            )}
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
          {activeView === 'options' && (
            <div className="bookbox-detail-container">
              <div className="bookbox-preview-section">
                <div className="bookbox-preview-card">
                  {bookBox.image && (
                    <div className="preview-image">
                      <img src={bookBox.image} alt={bookBox.name} />
                    </div>
                  )}
                  <div className="preview-info">
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
          )}

          {activeView === 'stats' && (
            <div className="stats-container">
              <div className="stats-header">
                <h3>Book Box Statistics</h3>
                <p>Statistics and analytics for "{bookBox.name}"</p>
              </div>
              
              {/* Transaction Graphs */}
              <TransactionGraphs 
                bookBoxId={bookBox.id} 
              />

              {/* Transaction Search Section */}
              <div className="transaction-search-section">
                <h4>Book Box Transactions</h4>
                <form onSubmit={handleTransactionSearch} className="transaction-search-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="username">Username</label>
                      <input
                        type="text"
                        id="username"
                        name="username"
                        value={transactionFilters.username}
                        onChange={handleTransactionInputChange}
                        placeholder="Filter by username"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="bookTitle">Book Title</label>
                      <input
                        type="text"
                        id="bookTitle"
                        name="bookTitle"
                        value={transactionFilters.bookTitle}
                        onChange={handleTransactionInputChange}
                        placeholder="Filter by book title"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="limit">Limit</label>
                      <select
                        id="limit"
                        name="limit"
                        value={transactionFilters.limit}
                        onChange={handleTransactionInputChange}
                      >
                        <option value={10}>10 results</option>
                        <option value={25}>25 results</option>
                        <option value={50}>50 results</option>
                        <option value={100}>100 results</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-actions">
                    <button type="submit" disabled={transactionLoading}>
                      {transactionLoading ? 'Searching...' : 'Search Transactions'}
                    </button>
                    <button type="button" onClick={handleClearTransactionFilters}>
                      Clear Filters
                    </button>
                  </div>
                </form>

                {transactionError && (
                  <div className="error-message">{transactionError}</div>
                )}

                {/* Transaction Results */}
                <div className="transaction-results">
                  {transactionLoading ? (
                    <div className="loading-message">
                      <p>Loading transactions...</p>
                    </div>
                  ) : hasSearchedTransactions ? (
                    <>
                      <div className="results-header">
                        <h5>
                          {transactions.length > 0 
                            ? `Found ${transactions.length} transaction${transactions.length !== 1 ? 's' : ''}`
                            : 'No transactions found for this book box'
                          }
                        </h5>
                      </div>
                      
                      {transactions.length > 0 ? (
                        <div className="transactions-list">
                          {transactions.map((transaction, index) => (
                            <TransactionCard 
                              key={transaction._id || index} 
                              transaction={transaction} 
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="no-results">
                          <p>No transactions match your search criteria for this book box.</p>
                        </div>
                      )}
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default BookBoxDetail
