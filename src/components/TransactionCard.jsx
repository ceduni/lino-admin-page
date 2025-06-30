import './TransactionCard.css'

function TransactionCard({ transaction }) {
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

  const getActionIcon = (action) => {
    return action === 'added' ? '📚' : '📖'
  }

  const getActionColor = (action) => {
    return action === 'added' ? '#10b981' : '#f59e0b'
  }

  return (
    <div className="transaction-card">
      <div className="transaction-header">
        <div className="transaction-action">
          <span className="action-icon">{getActionIcon(transaction.action)}</span>
          <span 
            className="action-text"
            style={{ color: getActionColor(transaction.action) }}
          >
            {transaction.action === 'added' ? 'Book Added' : 'Book Taken'}
          </span>
        </div>
        <div className="transaction-date">
          {formatDate(transaction.timestamp)}
        </div>
      </div>
      
      <div className="transaction-body">
        <h3 className="book-title">{transaction.bookTitle}</h3>
        <div className="transaction-details">
          <div className="detail-item">
            <span className="detail-label">User:</span>
            <span className="detail-value">{transaction.username}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Book Box ID:</span>
            <span className="detail-value">{transaction.bookboxId}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TransactionCard
