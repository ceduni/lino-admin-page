import { useState } from 'react'
import { 
  FiSearch,
  FiCheck,
  FiRotateCcw,
  FiChevronDown,
  FiChevronUp,
  FiCircle,
  FiCheckCircle,
  FiXCircle,
  FiClock
} from 'react-icons/fi'
import './IssueCard.css'

function IssueCard({ issue, onStatusChange }) {
  const [isExpanded, setIsExpanded] = useState(false)

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return '#e74c3c'
      case 'in_progress': return '#f39c12'
      case 'resolved': return '#27ae60'
      default: return '#95a5a6'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open': return <FiXCircle />
      case 'in_progress': return <FiClock />
      case 'resolved': return <FiCheckCircle />
      default: return <FiCircle />
    }
  }

  const getStatusBackgroundColor = (status) => {
    switch (status) {
      case 'open': return 'rgba(231, 76, 60, 0.05)'
      case 'in_progress': return 'rgba(243, 156, 18, 0.05)'
      case 'resolved': return 'rgba(39, 174, 96, 0.05)'
      default: return 'rgba(149, 165, 166, 0.05)'
    }
  }

  const getStatusBorderColor = (status) => {
    switch (status) {
      case 'open': return 'rgba(231, 76, 60, 0.2)'
      case 'in_progress': return 'rgba(243, 156, 18, 0.2)'
      case 'resolved': return 'rgba(39, 174, 96, 0.2)'
      default: return 'rgba(149, 165, 166, 0.2)'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleStatusChange = (action) => {
    if (onStatusChange) {
      onStatusChange(issue._id, action)
    }
  }

  return (
    <div 
      className="issue-card-compact"
      style={{ 
        backgroundColor: getStatusBackgroundColor(issue.status),
        borderColor: getStatusBorderColor(issue.status)
      }}
    >
      <div className="issue-card-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="issue-card-main-info">
          <div className="issue-status-compact">
            <span 
              className="status-badge-compact" 
              style={{ backgroundColor: getStatusColor(issue.status) }}
            >
              {getStatusIcon(issue.status)} {issue.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>
          <h4 className="issue-subject-compact">{issue.subject}</h4>
          <div className="issue-date-compact">
            {formatDate(issue.reportedAt)}
          </div>
        </div>
        <div className="expand-chevron">
          {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
        </div>
      </div>
      
      {isExpanded && (
        <div className="issue-card-expanded">
          <div className="issue-description-section">
            <p className="issue-description-compact">{issue.description}</p>
          </div>
          
          <div className="issue-meta-compact">
            <div className="issue-reporter-compact">
              <strong>Reporter:</strong> {issue.username} ({issue.email})
            </div>
            {issue.resolvedAt && (
              <div className="issue-resolved-compact">
                <strong>Resolved:</strong> {formatDate(issue.resolvedAt)}
              </div>
            )}
          </div>
          
          <div className="issue-actions-compact">
            {issue.status === 'open' && (
              <button 
                className="issue-action-btn-compact investigate-btn-compact"
                onClick={() => handleStatusChange('investigate')}
              >
                <FiSearch /> Investigate
              </button>
            )}
            {issue.status === 'in_progress' && (
              <button 
                className="issue-action-btn-compact close-btn-compact"
                onClick={() => handleStatusChange('close')}
              >
                <FiCheck /> Mark Resolved
              </button>
            )}
            {issue.status === 'resolved' && (
              <button 
                className="issue-action-btn-compact reopen-btn-compact"
                onClick={() => handleStatusChange('reopen')}
              >
                <FiRotateCcw /> Reopen
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default IssueCard
