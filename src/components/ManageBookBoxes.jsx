import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Wrapper } from '@googlemaps/react-wrapper'
import { tokenService, bookboxesAPI, qrCodeAPI } from '../services/api'
import logo from '../assets/logo.png'
import './SubPage.css'
import './ManageBookBoxes.css'

function ManageBookBoxes() {
  const navigate = useNavigate()
  const [searchFilters, setSearchFilters] = useState({
    kw: '',
    cls: 'by name',
    asc: true
  })
  const [userLocation, setUserLocation] = useState(null)
  const [hasGeolocation, setHasGeolocation] = useState(false)
  const [bookBoxes, setBookBoxes] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedBookBox, setSelectedBookBox] = useState(null)
  const [isUpdating, setIsUpdating] = useState(false)

  // Update form states
  const [updateFormData, setUpdateFormData] = useState({
    name: '',
    infoText: ''
  })
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [location, setLocation] = useState({ lat: 43.6532, lng: -79.3832 })
  const [shouldCenterMap, setShouldCenterMap] = useState(false)
  const [qrCodeData, setQrCodeData] = useState(null)
  const [qrCodeUrl, setQrCodeUrl] = useState(null)
  const [showQrCode, setShowQrCode] = useState(false)
  const [isGeneratingQr, setIsGeneratingQr] = useState(false)
  const mapRef = useRef(null)
  const markerRef = useRef(null)

  useEffect(() => {
    // Get user's current location for search
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          setUserLocation(userPos)
          setHasGeolocation(true)
        },
        (error) => {
          console.warn('Could not get user location:', error)
          setHasGeolocation(false)
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

  const handleSearchInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setSearchFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const filters = {
        kw: searchFilters.kw,
        cls: searchFilters.cls,
        asc: searchFilters.asc
      }

      // Add location data if available and searching by location
      if (hasGeolocation && userLocation && searchFilters.cls === 'by location') {
        filters.longitude = userLocation.lng
        filters.latitude = userLocation.lat
      }

      const response = await bookboxesAPI.searchBookBoxes(filters)
      setBookBoxes(response.bookboxes || response)
    } catch (err) {
      setError(err.message)
      console.error('Error searching book boxes:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBookBoxClick = async (bookBox) => {
    try {
      setIsLoading(true)
      const fullBookBoxData = await bookboxesAPI.getBookBox(bookBox.id)
      setSelectedBookBox(fullBookBoxData)
      
      // Prefill the update form
      setUpdateFormData({
        name: fullBookBoxData.name || '',
        infoText: fullBookBoxData.infoText || ''
      })
      setLocation({
        lat: fullBookBoxData.latitude || 43.6532,
        lng: fullBookBoxData.longitude || -79.3832
      })
      setImagePreview(fullBookBoxData.image || null)
      setSelectedImage(null)
      setShouldCenterMap(true)
    } catch (err) {
      setError(err.message)
      console.error('Error fetching book box details:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateInputChange = (e) => {
    const { name, value } = e.target
    setUpdateFormData(prev => ({
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

  const handleUpdateSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsUpdating(true)

    try {
      if (!updateFormData.name.trim()) {
        throw new Error('Name is required')
      }

      let imageUrl = imagePreview
      
      // Upload new image if selected
      if (selectedImage) {
        imageUrl = await uploadImageToImgBB(selectedImage)
      }

      const updateData = {
        name: updateFormData.name,
        image: imageUrl,
        longitude: location.lng,
        latitude: location.lat,
        infoText: updateFormData.infoText || ''
      }

      await bookboxesAPI.updateBookBox(selectedBookBox.id, updateData)
      
      // Reset form and go back to search
      setSelectedBookBox(null)
      setUpdateFormData({ name: '', infoText: '' })
      setSelectedImage(null)
      setImagePreview(null)
      
      // Refresh search results
      if (bookBoxes.length > 0) {
        handleSearch({ preventDefault: () => {} })
      }

    } catch (err) {
      setError(err.message)
      console.error('Error updating book box:', err)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteBookBox = async () => {
    if (!selectedBookBox || !window.confirm('Are you sure you want to delete this book box?')) {
      return
    }

    try {
      setIsUpdating(true)
      await bookboxesAPI.deleteBookBox(selectedBookBox.id)
      
      // Reset form and go back to search
      setSelectedBookBox(null)
      setUpdateFormData({ name: '', infoText: '' })
      setSelectedImage(null)
      setImagePreview(null)
      
      // Refresh search results
      if (bookBoxes.length > 0) {
        handleSearch({ preventDefault: () => {} })
      }
    } catch (err) {
      setError(err.message)
      console.error('Error deleting book box:', err)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleGenerateQR = async () => {
    if (!selectedBookBox) return

    setError('')
    setIsGeneratingQr(true)

    try {
      // Generate QR code with the book box ID
      const qrBlob = await qrCodeAPI.createQR(selectedBookBox.id.toString())
      const qrUrl = await qrCodeAPI.blobToDataURL(qrBlob)
      
      // Store QR code data and show QR section
      setQrCodeData(qrBlob)
      setQrCodeUrl(qrUrl)
      setShowQrCode(true)
    } catch (err) {
      setError(err.message)
      console.error('Error generating QR code:', err)
    } finally {
      setIsGeneratingQr(false)
    }
  }

  const handleDownloadQR = () => {
    if (qrCodeData && selectedBookBox) {
      const filename = `${selectedBookBox.name.replace(/[^a-zA-Z0-9]/g, '_')}_QR_code.png`
      qrCodeAPI.downloadBlob(qrCodeData, filename)
    }
  }

  const handleCloseQR = () => {
    setShowQrCode(false)
    setQrCodeData(null)
    setQrCodeUrl(null)
  }

  const initMap = (map) => {
    mapRef.current = map
    
    const marker = new window.google.maps.Marker({
      position: location,
      map: map,
      draggable: true,
      title: 'Book Box Location'
    })
    
    markerRef.current = marker

    marker.addListener('dragend', () => {
      const position = marker.getPosition()
      setLocation({
        lat: position.lat(),
        lng: position.lng()
      })
    })

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

    useEffect(() => {
      if (mapRef.current && markerRef.current) {
        markerRef.current.setPosition(location)
        
        if (shouldCenterMap) {
          mapRef.current.setCenter(location)
          setShouldCenterMap(false)
        }
      }
    }, [location, shouldCenterMap])

    return <div ref={localMapRef} className="map-container" />
  }

  // If updating a book box, show the update form
  if (selectedBookBox) {
    return (
      <div className="subpage-container">
        <header className="subpage-header">
          <div className="header-content">
            <div className="header-left">
              <img src={logo} alt="Lino Logo" className="header-logo" />
              <h1 className="subpage-title">Update Book Box</h1>
            </div>
            <div className="header-actions">
              <button onClick={() => setSelectedBookBox(null)} className="back-button">
                ← Back to Search
              </button>
              <button onClick={handleBackToDashboard} className="back-button">
                ← Dashboard
              </button>
              <button onClick={handleLogout} className="logout-button">
                Logout
              </button>
            </div>
          </div>
        </header>

        <main className="subpage-main">
          <div className="subpage-content">
            <form onSubmit={handleUpdateSubmit} className="register-form">
              {error && <div className="error-message">{error}</div>}
              
              <div className="form-section">
                <h3>Book Box Information</h3>
                <div className="form-group">
                  <label htmlFor="name">Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={updateFormData.name}
                    onChange={handleUpdateInputChange}
                    placeholder="Enter book box name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="infoText">Info Text (Optional)</label>
                  <textarea
                    id="infoText"
                    name="infoText"
                    value={updateFormData.infoText}
                    onChange={handleUpdateInputChange}
                    placeholder="Enter additional information about this book box"
                    rows="3"
                  />
                </div>
              </div>

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

              <div className="form-actions">
                <button 
                  type="submit" 
                  className="submit-button"
                  disabled={isUpdating}
                >
                  {isUpdating ? 'Updating Book Box...' : 'Update Book Box'}
                </button>
                <button 
                  type="button" 
                  onClick={handleGenerateQR}
                  className="qr-button"
                  disabled={isGeneratingQr}
                >
                  {isGeneratingQr ? 'Generating QR...' : '📱 Generate QR Code'}
                </button>
                <button 
                  type="button" 
                  onClick={handleDeleteBookBox}
                  className="delete-button"
                  disabled={isUpdating}
                >
                  Delete Book Box
                </button>
              </div>
            </form>

            {/* QR Code Section */}
            {showQrCode && qrCodeUrl && (
              <div className="qr-code-section">
                <div className="form-section">
                  <h3>QR Code for "{selectedBookBox.name}"</h3>
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
                    <button onClick={handleCloseQR} className="close-qr-button">
                      Close
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

  // Main search interface
  return (
    <div className="subpage-container">
      <header className="subpage-header">
        <div className="header-content">
          <div className="header-left">
            <img src={logo} alt="Lino Logo" className="header-logo" />
            <h1 className="subpage-title">Manage Book Boxes</h1>
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
          {error && <div className="error-message">{error}</div>}
          
          {/* Search Form */}
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-section">
              <h3>Search Book Boxes</h3>
              
              <div className="search-row">
                <div className="form-group">
                  <label htmlFor="kw">Search Query</label>
                  <input
                    type="text"
                    id="kw"
                    name="kw"
                    value={searchFilters.kw}
                    onChange={handleSearchInputChange}
                    placeholder="Enter search keywords..."
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="cls">Search By</label>
                  <select
                    id="cls"
                    name="cls"
                    value={searchFilters.cls}
                    onChange={handleSearchInputChange}
                  >
                    <option value="by name">By Name</option>
                    <option value="by number of books">By Number of Books</option>
                    {hasGeolocation && <option value="by location">By Location</option>}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="asc">Sort Order</label>
                  <select
                    id="asc"
                    name="asc"
                    value={searchFilters.asc}
                    onChange={handleSearchInputChange}
                  >
                    <option value={true}>Ascending</option>
                    <option value={false}>Descending</option>
                  </select>
                </div>
                
                <button type="submit" className="search-button" disabled={isLoading}>
                  {isLoading ? 'Searching...' : 'Search'}
                </button>
              </div>
              
              {!hasGeolocation && (
                <p className="location-warning">
                  Location access not available. "By Location" search option is disabled.
                </p>
              )}
            </div>
          </form>

          {/* Search Results */}
          {bookBoxes.length > 0 && (
            <div className="results-section">
              <h3>Search Results ({bookBoxes.length} found)</h3>
              <div className="bookbox-grid">
                {bookBoxes.map((bookBox) => (
                  <div 
                    key={bookBox.id} 
                    className="bookbox-card"
                    onClick={() => handleBookBoxClick(bookBox)}
                  >
                    {bookBox.image && (
                      <img src={bookBox.image} alt={bookBox.name} className="bookbox-image" />
                    )}
                    <div className="bookbox-info">
                      <h4>{bookBox.name}</h4>
                      {bookBox.infoText && <p className="bookbox-description">{bookBox.infoText}</p>}
                      <div className="bookbox-meta">
                        <span>Books: {bookBox.bookCount || 0}</span>
                        <span>Location: {bookBox.latitude?.toFixed(4)}, {bookBox.longitude?.toFixed(4)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {bookBoxes.length === 0 && !isLoading && (
            <div className="no-results">
              <p>No book boxes found. Try adjusting your search criteria.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default ManageBookBoxes
