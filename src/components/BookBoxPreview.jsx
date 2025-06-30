import { useState, useEffect } from 'react'
import { bookboxesAPI } from '../services/api'
import './BookBoxPreview.css'

function BookBoxPreview({ bookboxId, onClose }) {
  const [bookBox, setBookBox] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchBookBox = async () => {
      try {
        setLoading(true)
        const data = await bookboxesAPI.getBookBox(bookboxId)
        setBookBox(data)
      } catch (err) {
        setError(err.message || 'Failed to load book box details')
      } finally {
        setLoading(false)
      }
    }

    if (bookboxId) {
      fetchBookBox()
    }
  }, [bookboxId])

  if (loading) {
    return (
      <div className="bookbox-preview">
        <div className="preview-loading">
          <div className="loading-spinner"></div>
          <p>Loading book box details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bookbox-preview">
        <div className="preview-error">
          <p>Error: {error}</p>
        </div>
      </div>
    )
  }

  if (!bookBox) {
    return null
  }

  const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${bookBox.latitude},${bookBox.longitude}&zoom=15&size=300x150&markers=color:red%7C${bookBox.latitude},${bookBox.longitude}&key=${import.meta.env.VITE_GMAPS_API_KEY || 'AIzaSyD2S0FbkhCA-w5ACASmelGH1jCoi7UcoYE'}`

  return (
    <div className="bookbox-preview">
      <div className="preview-header">
        <h3 className="preview-title">{bookBox.name}</h3>
        <span className="preview-id">ID: {bookBox.id}</span>
      </div>
      
      <div className="preview-content">
        {bookBox.image && (
          <div className="preview-image">
            <img src={bookBox.image} alt={bookBox.name} />
          </div>
        )}
        
        <div className="preview-map">
          <img 
            src={mapUrl} 
            alt={`Map showing location of ${bookBox.name}`}
            onError={(e) => {
              e.target.style.display = 'none'
              e.target.nextSibling.style.display = 'block'
            }}
          />
          <div className="map-fallback" style={{ display: 'none' }}>
            <div className="map-placeholder">
              📍 Map unavailable
            </div>
          </div>
        </div>
      </div>
      
      {bookBox.infoText && (
        <div className="preview-info">
          <p>{bookBox.infoText}</p>
        </div>
      )}
      
      <div className="preview-location">
        <span className="location-coords">
          📍 {bookBox.latitude.toFixed(6)}, {bookBox.longitude.toFixed(6)}
        </span>
      </div>
    </div>
  )
}

export default BookBoxPreview
