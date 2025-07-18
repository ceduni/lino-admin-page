import { useState } from 'react'
import { format } from 'timeago.js'
import BookBoxPreview from '../BookBoxPreview/BookBoxPreview'
import './TransactionCard.css'

function TransactionCard({ transaction }) {
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

  const handleBookBoxHover = () => {
    if (previewTimeout) {
      clearTimeout(previewTimeout)
    }
    const timeout = setTimeout(() => {
      setShowPreview(true)
    }, 500) // 500ms delay before showing preview
    setPreviewTimeout(timeout)
  }

  const handleBookBoxLeave = () => {
    if (previewTimeout) {
      clearTimeout(previewTimeout)
      setPreviewTimeout(null)
    }
    setShowPreview(false)
  }

  return (
    <div className="transaction-card">
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
            the book <strong>"{transaction.bookTitle}"</strong>{' '}
            {getPreposition(transaction.action)} book box{' '}
            <span 
              className="bookbox-id-hover"
              onMouseEnter={handleBookBoxHover}
              onMouseLeave={handleBookBoxLeave}
            >
              <strong>{transaction.bookboxId}</strong>
              {showPreview && (
                <BookBoxPreview 
                  bookboxId={transaction.bookboxId}
                  onClose={() => setShowPreview(false)}
                />
              )}
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

export default TransactionCard
