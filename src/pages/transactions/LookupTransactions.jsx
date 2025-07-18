import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { tokenService, transactionsAPI } from '../../services/api'
import TransactionCard from '../../components/ui/TransactionCard/TransactionCard'
import logo from '../../assets/logo.png'
import './LookupTransactions.css'

function LookupTransactions() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState({
    username: '',
    bookTitle: '',
    bookboxId: '',
    limit: 50
  })
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [hasSearched, setHasSearched] = useState(false)

  const handleLogout = () => {
    tokenService.removeToken()
    navigate('/')
  }

  const handleBackToMain = () => {
    navigate('/main')
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setHasSearched(true)

    try {
      // Filter out empty values
      const searchFilters = Object.entries(filters).reduce((acc, [key, value]) => {
        if (value && value.toString().trim() !== '') {
          acc[key] = key === 'limit' ? parseInt(value) : value.toString().trim()
        }
        return acc
      }, {})

      const data = await transactionsAPI.searchTransactions(searchFilters)
      setTransactions(data.transactions || data || [])
    } catch (err) {
      setError(err.message || 'Failed to fetch transactions')
      setTransactions([])
    } finally {
      setLoading(false)
    }
  }

  const handleClearFilters = () => {
    setFilters({
      username: '',
      bookTitle: '',
      bookboxId: '',
      limit: 50
    })
    setTransactions([])
    setError('')
    setHasSearched(false)
  }

  // Load all transactions on component mount
  useEffect(() => {
    const loadInitialTransactions = async () => {
      setLoading(true)
      try {
        const data = await transactionsAPI.searchTransactions({ limit: 20 })
        setTransactions(data.transactions || data || [])
        setHasSearched(true)
      } catch (err) {
        setError('Failed to load transactions')
      } finally {
        setLoading(false)
      }
    }

    loadInitialTransactions()
  }, [])

  return (
    <div className="subpage-container">
      <header className="subpage-header">
        <div className="header-content">
          <div className="header-left">
            <img src={logo} alt="Lino Logo" className="header-logo" />
            <h1 className="subpage-title">Lookup Book Transactions</h1>
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
          <div className="search-section">
            <h2 className="search-title">Search Transactions</h2>
            <form onSubmit={handleSearch} className="search-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="username" className="form-label">Username</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={filters.username}
                    onChange={handleInputChange}
                    placeholder="Enter username"
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="bookTitle" className="form-label">Book Title</label>
                  <input
                    type="text"
                    id="bookTitle"
                    name="bookTitle"
                    value={filters.bookTitle}
                    onChange={handleInputChange}
                    placeholder="Enter book title"
                    className="form-input"
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="bookboxId" className="form-label">Book Box ID</label>
                  <input
                    type="text"
                    id="bookboxId"
                    name="bookboxId"
                    value={filters.bookboxId}
                    onChange={handleInputChange}
                    placeholder="Enter book box ID"
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="limit" className="form-label">Limit Results</label>
                  <select
                    id="limit"
                    name="limit"
                    value={filters.limit}
                    onChange={handleInputChange}
                    className="form-input"
                  >
                    <option value={10}>10 results</option>
                    <option value={25}>25 results</option>
                    <option value={50}>50 results</option>
                    <option value={100}>100 results</option>
                  </select>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" disabled={loading} className="search-button">
                  {loading ? 'Searching...' : 'Search Transactions'}
                </button>
                <button type="button" onClick={handleClearFilters} className="clear-button">
                  Clear Filters
                </button>
              </div>
            </form>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="results-section">
            {loading ? (
              <div className="loading-message">
                <div className="loading-spinner"></div>
                <p>Loading transactions...</p>
              </div>
            ) : hasSearched ? (
              <>
                <div className="results-header">
                  <h3 className="results-title">
                    {transactions.length > 0 
                      ? `Found ${transactions.length} transaction${transactions.length !== 1 ? 's' : ''}`
                      : 'No transactions found'
                    }
                  </h3>
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
                    <div className="no-results-icon">🔍</div>
                    <p className="no-results-text">
                      No transactions match your search criteria. Try adjusting your filters.
                    </p>
                  </div>
                )}
              </>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  )
}

export default LookupTransactions
