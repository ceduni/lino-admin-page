import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminAPI } from '../../services/api'
import { 
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiUserCheck,
  FiUserX,
  FiShield,
  FiUser
} from 'react-icons/fi'
import AdminHeader from '../../components/ui/AdminHeader/AdminHeader'
import PageHeader from '../../components/ui/PageHeader/PageHeader'
import '../MainPage/SubPage.css'
import './SuperAdminPage.css'

function SuperAdminPage() {
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalResults: 0,
    hasNextPage: false,
    hasPrevPage: false,
    limit: 25
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const superAdminUsername = import.meta.env.VITE_SUPER_ADMIN_USERNAME

  // Fetch users with pagination
  const fetchUsers = async (query = '', page = 1) => {
    setIsLoading(true)
    setError('')
    try {
      const response = await adminAPI.searchUsers(query, pagination.limit, page)
      setUsers(response.users || [])
      setPagination(response.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalResults: 0,
        hasNextPage: false,
        hasPrevPage: false,
        limit: 25
      })
    } catch (err) {
      setError(err.message || 'Failed to load users')
      setUsers([])
    } finally {
      setIsLoading(false)
    }
  }

  // Initial load
  useEffect(() => {
    fetchUsers('', 1)
  }, [])

  const handleSearch = async (e) => {
    const query = e.target.value
    setSearchQuery(query)
    
    // Reset to first page when searching
    setPagination(prev => ({ ...prev, currentPage: 1 }))
    
    // Fetch users with search query
    await fetchUsers(query, 1)
  }

  const handlePageChange = async (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, currentPage: newPage }))
      await fetchUsers(searchQuery, newPage)
    }
  }

  const handleToggleAdmin = async (username, isCurrentlyAdmin) => {
    setIsUpdating(true)
    setError('')
    
    try {
      if (isCurrentlyAdmin) {
        await adminAPI.removeAdmin(username)
      } else {
        await adminAPI.addAdmin(username)
      }
      
      // Refresh the current page
      await fetchUsers(searchQuery, pagination.currentPage)
    } catch (err) {
      setError(err.message || `Failed to ${isCurrentlyAdmin ? 'remove' : 'add'} admin privileges`)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleBackToMain = () => {
    navigate('/main')
  }

  return (
    <div className="subpage-container">
      <AdminHeader />
      <PageHeader title="Super Admin Panel" onBack={handleBackToMain} />

      <main className="subpage-main">
        <div className="subpage-content">
          <div className="super-admin-container">
            
            {/* Search Section */}
            <div className="search-section">
              <h3>User Management</h3>
              <div className="search-bar">
                <div className="search-input-container">
                  <FiSearch className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search users by username or email..."
                    value={searchQuery}
                    onChange={handleSearch}
                    className="search-input"
                  />
                </div>
              </div>
              
              {!isLoading && (
                <div className="users-header">
                  <p>Showing {users.length} of {pagination.totalResults} users</p>
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && <div className="error-message">{error}</div>}

            {/* Users List */}
            <div className="users-section">
              {isLoading ? (
                <div className="users-loading">
                  <p>Loading users...</p>
                </div>
              ) : users.length > 0 ? (
                <div className="users-grid">
                  {users.map((user) => (
                    <div 
                      key={user._id} 
                      className={`user-card ${user.isAdmin ? 'admin-user' : 'regular-user'}`}
                    >
                      <div className="user-card-header">
                        <div className="user-info">
                          <div className="user-avatar">
                            {user.isAdmin ? (
                              <FiShield className="admin-icon" />
                            ) : (
                              <FiUser className="user-icon" />
                            )}
                          </div>
                          <div className="user-details">
                            <h4 className="user-username">{user.username}</h4>
                            <p className="user-email">{user.email}</p>
                            <span className={`user-role ${user.isAdmin ? 'admin-role' : 'user-role'}`}>
                              {user.isAdmin ? 'Admin' : 'User'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="user-actions">
                          {user.username === superAdminUsername ? (
                            <div className="super-admin-badge">
                              <FiShield className="super-admin-badge-icon" />
                              <span>Super Admin</span>
                            </div>
                          ) : (
                            <button
                              className={`admin-toggle-btn ${user.isAdmin ? 'remove-admin' : 'add-admin'}`}
                              onClick={() => handleToggleAdmin(user.username, user.isAdmin)}
                              disabled={isUpdating}
                            >
                              {user.isAdmin ? (
                                <>
                                  <FiUserX /> Remove Admin
                                </>
                              ) : (
                                <>
                                  <FiUserCheck /> Make Admin
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-users">
                  {searchQuery ? 'No users found matching your search.' : 'No users available.'}
                </div>
              )}
            </div>

            {/* Pagination */}
            {!isLoading && pagination.totalPages > 1 && (
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
        </div>
      </main>
    </div>
  )
}

export default SuperAdminPage
