import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { bookboxesAPI, issuesAPI } from '../../services/api'
import { 
  FiSettings, 
  FiBarChart2, 
  FiAlertCircle,
  FiCheck,
  FiChevronLeft,
  FiChevronRight,
  FiCheckCircle,
  FiXCircle
} from 'react-icons/fi'
import AdminHeader from '../../components/ui/AdminHeader/AdminHeader'
import PageHeader from '../../components/ui/PageHeader/PageHeader'
import IssueCard from '../../components/ui/IssueCard/IssueCard'
import '../MainPage/SubPage.css'
import './BookBoxDetail.css'

function BookBoxDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [bookBox, setBookBox] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Issues state
  const [issues, setIssues] = useState([])
  const [issuesLoading, setIssuesLoading] = useState(false)
  const [issuesError, setIssuesError] = useState('')
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalResults: 0,
    hasNextPage: false,
    hasPrevPage: false,
    limit: 5
  })

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

  // Fetch issues for this bookbox
  useEffect(() => {
    const fetchIssues = async () => {
      if (!id) return
      
      try {
        setIssuesLoading(true)
        setIssuesError('')
        const response = await issuesAPI.searchIssues({
          bookboxId: id,
          limit: pagination.limit,
          page: pagination.currentPage,
          oldestFirst: false
        })
        setIssues(response.issues || [])
        setPagination(response.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalResults: 0,
          hasNextPage: false,
          hasPrevPage: false,
          limit: 5
        })
      } catch (err) {
        setIssuesError(err.message || 'Failed to load issues')
        setIssues([])
      } finally {
        setIssuesLoading(false)
      }
    }

    fetchIssues()
  }, [id, pagination.currentPage])


  const handleUpdateBookBox = () => {
    navigate(`/update-book-box/${id}`)
  }

  const handleViewStats = () => {
    navigate(`/book-box/${id}/stats`)
  }

  // Issue management functions
  const handleIssueStatusChange = async (issueId, action) => {
    try {
      if (action === 'investigate') {
        await issuesAPI.investigateIssue(issueId)
      } else if (action === 'close') {
        await issuesAPI.closeIssue(issueId)
      } else if (action === 'reopen') {
        await issuesAPI.reopenIssue(issueId)
      }
      
      // Refresh issues after status change
      const response = await issuesAPI.searchIssues({
        bookboxId: id,
        limit: pagination.limit,
        page: pagination.currentPage,
        oldestFirst: false
      })
      setIssues(response.issues || [])
      setPagination(response.pagination || pagination)
    } catch (err) {
      setIssuesError(err.message || 'Failed to update issue status')
    }
  }

  // Pagination functions
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({
        ...prev,
        currentPage: newPage
      }))
    }
  }


  if (isLoading) {
    return (
      <div className="subpage-container">
        <AdminHeader />
        <PageHeader />
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
        <AdminHeader />
        <PageHeader />
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
      <PageHeader title={bookBox?.name} />

      <main className="subpage-main">
        <div className="subpage-content">
          <div className="bookbox-detail-container">
            <div className="main-content-layout">
              <div className="left-column">
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
                            <span className="meta-value">{bookBox.booksCount || 0}</span>
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
                              {bookBox.isActive ? <><FiCheckCircle /> Active</> : <><FiXCircle /> Inactive</>}
                            </span>
                          </div>
                        </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="right-column">
                <div className="action-options">
                  <h3>Actions</h3>
                  <div className="action-buttons">
                    <button className="action-btn" onClick={handleUpdateBookBox}>
                      <FiSettings className="action-icon" />
                      <span className="action-text">Update Book Box</span>
                    </button>
                    
                    <button className="action-btn" onClick={handleViewStats}>
                      <FiBarChart2 className="action-icon" />
                      <span className="action-text">View Stats</span>
                    </button>
                  </div>
                </div>

                {/* Issues Section */}
                <div className="issues-section">
                  <h3><FiAlertCircle className="section-icon" /> Reported Issues</h3>
                  
                  {issuesLoading ? (
                    <div className="issues-loading">
                      <p>Loading issues...</p>
                    </div>
                  ) : issuesError ? (
                    <div className="issues-error">
                      <p>Error loading issues: {issuesError}</p>
                    </div>
                  ) : issues.length === 0 ? (
                    <div className="no-issues">
                      <div className="no-issues-card">
                        <FiCheck className="no-issues-icon" />
                        <h4>No Issues Reported</h4>
                        <p>This book box has no reported issues. Great job!</p>
                      </div>
                    </div>
                  ) : (
                    <div className="issues-container">
                      <div className="issues-header">
                        <p>Showing {issues.length} of {pagination.totalResults} issues</p>
                      </div>
                      
                      <div className="issues-list">
                        {issues.map((issue) => (
                          <IssueCard 
                            key={issue._id} 
                            issue={issue} 
                            onStatusChange={handleIssueStatusChange}
                          />
                        ))}
                      </div>
                      
                      {/* Pagination */}
                      {pagination.totalPages > 1 && (
                        <div className="pagination">
                          <button 
                            className="pagination-btn"
                            onClick={() => handlePageChange(pagination.currentPage - 1)}
                            disabled={!pagination.hasPrevPage}
                          >
                            <FiChevronLeft /> Previous
                          </button>
                          
                          <div className="pagination-info">
                            <span>Page {pagination.currentPage} of {pagination.totalPages}</span>
                          </div>
                          
                          <button 
                            className="pagination-btn"
                            onClick={() => handlePageChange(pagination.currentPage + 1)}
                            disabled={!pagination.hasNextPage}
                          >
                            Next <FiChevronRight />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
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
