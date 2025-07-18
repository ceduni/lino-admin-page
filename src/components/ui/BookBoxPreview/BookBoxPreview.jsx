import { useState, useEffect } from 'react'
import { bookboxesAPI } from '../../../services/api'
import './BookBoxPreview.css'

function BookBoxPreview({ bookboxId, onClose }) {
  const [bookBox, setBookBox] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [userLocation, setUserLocation] = useState(null)
  const [distance, setDistance] = useState(null)

  // Function to calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371 // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    const distance = R * c // Distance in kilometers
    return distance
  }

  // Function to format distance for display
  const formatDistance = (distanceKm) => {
    if (distanceKm < 1) {
      return `${Math.round(distanceKm * 1000)}m away`
    } else if (distanceKm < 10) {
      return `${distanceKm.toFixed(1)}km away`
    } else {
      return `${Math.round(distanceKm)}km away`
    }
  }

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          })
        },
        (error) => {
          // Silently fail - don't show distance if location permission denied
          console.log('Location permission denied or unavailable')
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 300000 // 5 minutes
        }
      )
    }
  }, [])

  // Calculate distance when both locations are available
  useEffect(() => {
    if (userLocation && bookBox) {
      const dist = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        bookBox.latitude,
        bookBox.longitude
      )
      setDistance(dist)
    }
  }, [userLocation, bookBox])

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

  const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${bookBox.latitude},${bookBox.longitude}&zoom=15&size=300x150&markers=color:red%7C${bookBox.latitude},${bookBox.longitude}&key=${import.meta.env.VITE_GMAPS_API_KEY}`

  return (
    <div className="bookbox-preview">
      <div className="preview-header">
        <h3 className="preview-title">{bookBox.name}</h3>
        {distance !== null && (
          <span className="preview-distance">
            📍 {formatDistance(distance)}
          </span>
        )}
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
      
      <div className="preview-details">
        <div className="preview-location">
          <span className="location-coords">
            📍 {bookBox.latitude.toFixed(6)}, {bookBox.longitude.toFixed(6)}
          </span>
        </div>
        
        <div className="preview-metadata">
          {bookBox.owner && (
            <div className="metadata-item">
              <span className="metadata-label">Owner:</span>
              <span className="metadata-value">{bookBox.owner}</span>
            </div>
          )}
          <div className="metadata-item">
            <span className="metadata-label">Status:</span>
            <span className={`metadata-value status-${bookBox.isActive ? 'active' : 'inactive'}`}>
              {bookBox.isActive ? '🟢 Active' : '🔴 Inactive'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookBoxPreview
