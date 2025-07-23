import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { bookboxesAPI, transactionsAPI } from '../../services/api'
import TransactionListItem from '../../components/ui/TransactionListItem/TransactionListItem'
import TransactionGraphs from '../../components/charts/TransactionGraphs/TransactionGraphs'
import AdminHeader from '../../components/ui/AdminHeader/AdminHeader'
import PageHeader from '../../components/ui/PageHeader/PageHeader'
import '../MainPage/SubPage.css'
import './BookBoxDetail.css'

function BookBoxStats() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [bookBox, setBookBox] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  
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
        // Load initial transactions for this book box
        await loadBookBoxTransactions(data)
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

  const handleBackToDetail = () => {
    navigate(`/book-box/${id}`)
  }

  const loadBookBoxTransactions = async (bookBoxData = bookBox) => {
    if (!bookBoxData) return
    
    setTransactionLoading(true)
    setTransactionError('')
    setHasSearchedTransactions(true)

    try {
      const searchFilters = {
        bookboxId: bookBoxData._id,
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
        bookboxId: bookBox._id,
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
        <AdminHeader />
        <PageHeader title="Loading..." onBack={handleBackToDetail} />
        <main className="subpage-main">
          <div className="subpage-content">
            <div className="loading-section">
              <p>Loading book box statistics...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="subpage-container">
        <AdminHeader />
        <PageHeader title="Error" onBack={handleBackToDetail} />
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
      <AdminHeader />
      <PageHeader title={`Stats: ${bookBox?.name}`} onBack={handleBackToDetail} />

      <main className="subpage-main">
        <div className="subpage-content">
          <div className="stats-container">
            <div className="stats-header">
              <h3>Book Box Statistics</h3>
              <p>Statistics and analytics for "{bookBox.name}"</p>
            </div>
            
            {/* Transaction Graphs */}
            <TransactionGraphs 
              bookBoxId={bookBox._id} 
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
                          <TransactionListItem 
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
        </div>
      </main>
    </div>
  )
}

export default BookBoxStats
