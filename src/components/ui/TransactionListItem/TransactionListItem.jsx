import { useState } from 'react'
import { format } from 'timeago.js'
import { useNavigate } from 'react-router-dom'
import './TransactionListItem.css'

function TransactionListItem({ transaction }) {
  const navigate = useNavigate()
  const [showPreview, setShowPreview] = useState(false)
  const [previewTimeout, setPreviewTimeout] = useState(null)

  const formatDate = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getActionText = (action) => {
    return action === 'added' ? 'added' : 'took'
  }

  const getPreposition = (action) => {
    return action === 'added' ? 'to' : 'from'
  }

  const getActionColor = (action) => {
    return action === 'added' ? '#10b981' : '#f59e0b'
  }

  const getActionIcon = (action) => {
    return action === 'added' ? '📚' : '📖'
  }

  const handleBookBoxClick = (bookboxId) => {
    window.open(`/book-box/${bookboxId}`, '_blank')
  }

  return (
    <div className="transaction-list-item">
      <div className="transaction-content">
        <div className="transaction-icon">
          {getActionIcon(transaction.action)}
        </div>
        <div className="transaction-text">
          <span className="transaction-description">
            <strong>{transaction.username}</strong>{' '}
            <span 
              className="action-word"
              style={{ color: getActionColor(transaction.action) }}
            >
              {getActionText(transaction.action)}
            </span>{' '}
            the book with ISBN <strong>"{transaction.isbn}"</strong>{' '}
            {getPreposition(transaction.action)} book box{' '}
            <span 
              className="bookbox-id-clickable"
              onClick={() => handleBookBoxClick(transaction.bookboxId)}
            >
              <strong>{transaction.bookboxId}</strong>
            </span>
          </span>
          <div className="transaction-time">
            {formatDate(transaction.timestamp)} ({format(transaction.timestamp)})
          </div>
        </div>
      </div>
    </div>
  )
}

export default TransactionListItem
