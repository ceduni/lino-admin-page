import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Wrapper } from '@googlemaps/react-wrapper'
import { tokenService, bookboxesAPI, qrCodeAPI } from '../services/api'
import logo from '../assets/logo.png'
import './SubPage.css'
import './RegisterBookBox.css'

function RegisterBookBox() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: '',
    infoText: ''
  })
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [location, setLocation] = useState({ lat: 43.6532, lng: -79.3832 }) // Default to Toronto
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [shouldCenterMap, setShouldCenterMap] = useState(false)
  const [qrCodeData, setQrCodeData] = useState(null)
  const [qrCodeUrl, setQrCodeUrl] = useState(null)
  const [createdBookBoxName, setCreatedBookBoxName] = useState('')
  const [showQrCode, setShowQrCode] = useState(false)
  const mapRef = useRef(null)
  const markerRef = useRef(null)

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
          setShouldCenterMap(true) // Only center map for initial geolocation
        },
        (error) => {
          console.warn('Could not get user location:', error)
          // Keep default location (Toronto)
        }
      )
    }
  }, [])

  const handleLogout = () => {
    tokenService.removeToken()
    navigate('/')
  }

  const handleBackToDashboard = () => {
    navigate('/dashboard')
  }

  const handleDownloadQR = () => {
    if (qrCodeData && createdBookBoxName) {
      const filename = `${createdBookBoxName.replace(/[^a-zA-Z0-9]/g, '_')}_QR_code.png`
      qrCodeAPI.downloadBlob(qrCodeData, filename)
    }
  }

  const handleContinueToDashboard = () => {
    setShowQrCode(false)
    setQrCodeData(null)
    setQrCodeUrl(null)
    setCreatedBookBoxName('')
    navigate('/dashboard')
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadImageToImgBB = async (imageFile) => {
    const formData = new FormData()
    formData.append('image', imageFile)

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMGBB_API_KEY}`, {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      throw new Error('Failed to upload image to ImgBB')
    }

    const data = await response.json()
    return data.data.url
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      if (!formData.title.trim()) {
        throw new Error('Title is required')
      }

      if (!selectedImage) {
        throw new Error('Please select an image')
      }

      // Upload image to ImgBB
      const imageUrl = await uploadImageToImgBB(selectedImage)

      // Create book box
      const bookBoxData = {
        name: formData.title,
        image: imageUrl,
        longitude: location.lng,
        latitude: location.lat,
        infoText: formData.infoText || ''
      }

      const response = await bookboxesAPI.createBookBox(bookBoxData)
      console.log('Book box created successfully:', response)

      // Generate QR code with the book box ID
      const qrBlob = await qrCodeAPI.createQR(response._id.toString())
      const qrUrl = await qrCodeAPI.blobToDataURL(qrBlob)
      
      // Store QR code data and show QR section
      setQrCodeData(qrBlob)
      setQrCodeUrl(qrUrl)
      setCreatedBookBoxName(formData.title)
      setShowQrCode(true)

      // Reset form
      setFormData({ title: '', infoText: '' })
      setSelectedImage(null)
      setImagePreview(null)

    } catch (err) {
      setError(err.message)
      console.error('Error creating book box:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const initMap = (map) => {
    mapRef.current = map
    
    // Create marker
    const marker = new window.google.maps.Marker({
      position: location,
      map: map,
      draggable: true,
      title: 'Book Box Location'
    })
    
    markerRef.current = marker

    // Update location when marker is dragged
    marker.addListener('dragend', () => {
      const position = marker.getPosition()
      setLocation({
        lat: position.lat(),
        lng: position.lng()
      })
    })

    // Update location when map is clicked
    map.addListener('click', (e) => {
      const newLocation = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng()
      }
      setLocation(newLocation)
      marker.setPosition(newLocation)
    })
  }

  const MapComponent = () => {
    const localMapRef = useRef(null)

    useEffect(() => {
      if (localMapRef.current && window.google) {
        const map = new window.google.maps.Map(localMapRef.current, {
          center: location,
          zoom: 15,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false
        })

        initMap(map)
      }
    }, [])

    // Separate effect to handle location changes
    useEffect(() => {
      if (mapRef.current && markerRef.current) {
        // Update marker position
        markerRef.current.setPosition(location)
        
        // Only re-center map if this is from initial geolocation
        if (shouldCenterMap) {
          mapRef.current.setCenter(location)
          setShouldCenterMap(false) // Reset flag after centering
        }
      }
    }, [location, shouldCenterMap])

    return <div ref={localMapRef} className="map-container" />
  }

  return (
    <div className="subpage-container">
      <header className="subpage-header">
        <div className="header-content">
          <div className="header-left">
            <img src={logo} alt="Lino Logo" className="header-logo" />
            <h1 className="subpage-title">Register New Book Box</h1>
          </div>
          <div className="header-actions">
            <button onClick={handleBackToDashboard} className="back-button">
              ← Back to Dashboard
            </button>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="subpage-main">
        <div className="subpage-content">
          <form onSubmit={handleSubmit} className="register-form">
            {error && <div className="error-message">{error}</div>}
            
            {/* Title and Info Text Section */}
            <div className="form-section">
              <h3>Book Box Information</h3>
              <div className="form-group">
                <label htmlFor="title">Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter book box title"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="infoText">Info Text (Optional)</label>
                <textarea
                  id="infoText"
                  name="infoText"
                  value={formData.infoText}
                  onChange={handleInputChange}
                  placeholder="Enter additional information about this book box"
                  rows="3"
                />
              </div>
            </div>

            {/* Image Upload Section */}
            <div className="form-section">
              <h3>Book Box Image</h3>
              <div className="image-upload-container">
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  capture="environment"
                  className="image-input"
                />
                <label htmlFor="image" className="image-upload-label">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="image-preview" />
                  ) : (
                    <div className="upload-placeholder">
                      <div className="upload-icon">📷</div>
                      <p>Take Photo or Select Image</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Map Section */}
            <div className="form-section">
              <h3>Location</h3>
              <p className="location-info">
                Current coordinates: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
              </p>
              <p className="location-instructions">
                Click on the map or drag the marker to set the book box location
              </p>
              <div className="map-wrapper">
                <Wrapper apiKey={import.meta.env.VITE_GMAPS_API_KEY}>
                  <MapComponent />
                </Wrapper>
              </div>
            </div>

            {/* Submit Button */}
            <div className="form-actions">
              <button 
                type="submit" 
                className="submit-button"
                disabled={isLoading}
              >
                {isLoading ? 'Creating Book Box...' : 'Create Book Box'}
              </button>
            </div>
          </form>

          {/* QR Code Section */}
          {showQrCode && qrCodeUrl && (
            <div className="qr-code-section">
              <div className="success-message">
                ✅ Book box "{createdBookBoxName}" created successfully!
              </div>
              <div className="form-section">
                <h3>QR Code Generated</h3>
                <p className="qr-instructions">
                  Your QR code has been generated. Download it and print it to place on your book box.
                </p>
                <div className="qr-code-container">
                  <img src={qrCodeUrl} alt="QR Code" className="qr-code-image" />
                </div>
                <div className="qr-actions">
                  <button onClick={handleDownloadQR} className="download-button">
                    📥 Download QR Code
                  </button>
                  <button onClick={handleContinueToDashboard} className="continue-button">
                    Continue to Dashboard
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}


export default RegisterBookBox
