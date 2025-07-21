import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Wrapper } from '@googlemaps/react-wrapper'
import { tokenService, bookboxesAPI, qrCodeAPI, adminAPI } from '../../services/api'
import logo from '../../assets/logo.png'
import '../MainPage/SubPage.css'
import './UpdateBookBoxPage.css'

function UpdateBookBoxPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [selectedBookBox, setSelectedBookBox] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState('')

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
  
  // New states for activation/deactivation and ownership transfer
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false)
  const [showTransferDialog, setShowTransferDialog] = useState(false)
  const [admins, setAdmins] = useState([])
  const [filteredAdmins, setFilteredAdmins] = useState([])
  const [adminSearchQuery, setAdminSearchQuery] = useState('')
  const [isLoadingAdmins, setIsLoadingAdmins] = useState(false)
  const [isTransferring, setIsTransferring] = useState(false)
  const [isToggling, setIsToggling] = useState(false)
  
  const mapRef = useRef(null)
  const markerRef = useRef(null)

  useEffect(() => {
    const fetchBookBox = async () => {
      try {
        setIsLoading(true)
        const fullBookBoxData = await bookboxesAPI.getBookBox(id)
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

    if (id) {
      fetchBookBox()
    }
  }, [id])

  const handleLogout = () => {
    tokenService.removeToken()
    navigate('/')
  }

  const handleBackToMain = () => {
    navigate('/main')
  }

  const handleBackToDetail = () => {
    navigate(`/book-box/${id}`)
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

      await bookboxesAPI.updateBookBox(selectedBookBox._id, updateData)
      
      // Navigate back to book box detail page
      navigate(`/book-box/${id}`)

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
      await bookboxesAPI.deleteBookBox(selectedBookBox._id)
      
      // Navigate back to main page after deletion
      navigate('/main')
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
      const qrBlob = await qrCodeAPI.createQR(selectedBookBox._id.toString())
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

  // New handler functions for activation/deactivation and ownership transfer
  const handleToggleActivation = async () => {
    if (!selectedBookBox) return

    if (selectedBookBox.isActive) {
      // Show deactivation confirmation dialog
      setShowDeactivateDialog(true)
    } else {
      // Activate directly without confirmation
      await performToggleActivation()
    }
  }

  const performToggleActivation = async () => {
    if (!selectedBookBox) return

    setError('')
    setIsToggling(true)

    try {
      if (selectedBookBox.isActive) {
        await bookboxesAPI.deactivateBookBox(selectedBookBox._id)
        setSelectedBookBox(prev => ({ ...prev, isActive: false }))
      } else {
        await bookboxesAPI.activateBookBox(selectedBookBox._id)
        setSelectedBookBox(prev => ({ ...prev, isActive: true }))
      }
      setShowDeactivateDialog(false)
    } catch (err) {
      setError(err.message)
      console.error('Error toggling book box activation:', err)
    } finally {
      setIsToggling(false)
    }
  }

  const handleTransferOwnership = async () => {
    if (!selectedBookBox) return

    setError('')
    setIsLoadingAdmins(true)
    
    try {
      const adminsList = await adminAPI.getAdmins()
      setAdmins(adminsList)
      setFilteredAdmins(adminsList)
      setShowTransferDialog(true)
    } catch (err) {
      setError(err.message)
      console.error('Error fetching admins:', err)
    } finally {
      setIsLoadingAdmins(false)
    }
  }

  const handleAdminSearch = (e) => {
    const query = e.target.value.toLowerCase()
    setAdminSearchQuery(query)
    
    if (query.trim() === '') {
      setFilteredAdmins(admins)
    } else {
      const filtered = admins.filter(admin => 
        admin.username.toLowerCase().includes(query) ||
        (admin.name && admin.name.toLowerCase().includes(query))
      )
      setFilteredAdmins(filtered)
    }
  }

  const handleSelectAdmin = async (adminUsername) => {
    if (!selectedBookBox || !adminUsername) return

    setError('')
    setIsTransferring(true)

    try {
      await bookboxesAPI.transferBookBoxOwnership(selectedBookBox._id, adminUsername)
      
      // Show success message and navigate back to main page
      alert(`Ownership successfully transferred to ${adminUsername}`)
      navigate('/main')
    } catch (err) {
      setError(err.message)
      console.error('Error transferring ownership:', err)
    } finally {
      setIsTransferring(false)
    }
  }

  const handleCloseTransferDialog = () => {
    setShowTransferDialog(false)
    setAdmins([])
    setFilteredAdmins([])
    setAdminSearchQuery('')
  }

  const handleCloseDeactivateDialog = () => {
    setShowDeactivateDialog(false)
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

  if (isLoading) {
    return (
      <div className="subpage-container">
        <header className="subpage-header">
          <div className="header-content">
            <div className="header-left">
              <img src={logo} alt="Lino Logo" className="header-logo" />
              <h1 className="subpage-title">Loading...</h1>
            </div>
            <div className="header-actions">
              <button onClick={handleBackToMain} className="back-button">
                ← Back to Main
              </button>
              <button onClick={handleLogout} className="logout-button">
                Logout
              </button>
            </div>
          </div>
        </header>
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

  if (error && !selectedBookBox) {
    return (
      <div className="subpage-container">
        <header className="subpage-header">
          <div className="header-content">
            <div className="header-left">
              <img src={logo} alt="Lino Logo" className="header-logo" />
              <h1 className="subpage-title">Error</h1>
            </div>
            <div className="header-actions">
              <button onClick={handleBackToMain} className="back-button">
                ← Back to Main
              </button>
              <button onClick={handleLogout} className="logout-button">
                Logout
              </button>
            </div>
          </div>
        </header>
        <main className="subpage-main">
          <div className="subpage-content">
            <div className="error-message">{error}</div>
          </div>
        </main>
      </div>
    )
  }

  if (!selectedBookBox) {
    return null
  }

  return (
    <div className="subpage-container">
      <header className="subpage-header">
        <div className="header-content">
          <div className="header-left">
            <img src={logo} alt="Lino Logo" className="header-logo" />
            <h1 className="subpage-title">Update Book Box</h1>
          </div>
          <div className="header-actions">
            <button onClick={handleBackToDetail} className="back-button">
              ← Back to Details
            </button>
            <button onClick={handleBackToMain} className="back-button">
              ← Main
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
                onClick={handleToggleActivation}
                className={selectedBookBox.isActive ? "deactivate-button" : "activate-button"}
                disabled={isToggling}
              >
                {isToggling ? 'Processing...' : (selectedBookBox.isActive ? '🔴 Deactivate' : '🟢 Activate')}
              </button>
              <button 
                type="button" 
                onClick={handleTransferOwnership}
                className="transfer-button"
                disabled={isLoadingAdmins}
              >
                {isLoadingAdmins ? 'Loading...' : '👤 Transfer Ownership'}
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

          {/* Deactivation Confirmation Dialog */}
          {showDeactivateDialog && (
            <div className="dialog-overlay">
              <div className="dialog-container">
                <div className="dialog-header">
                  <h3>Confirm Deactivation</h3>
                </div>
                <div className="dialog-content">
                  <p>Are you sure you want to deactivate the book box "{selectedBookBox.name}"?</p>
                  <p>This will make the book box unavailable for transactions.</p>
                </div>
                <div className="dialog-actions">
                  <button 
                    onClick={performToggleActivation}
                    className="confirm-button"
                    disabled={isToggling}
                  >
                    {isToggling ? 'Deactivating...' : 'Yes, Deactivate'}
                  </button>
                  <button 
                    onClick={handleCloseDeactivateDialog}
                    className="cancel-button"
                    disabled={isToggling}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Transfer Ownership Dialog */}
          {showTransferDialog && (
            <div className="dialog-overlay">
              <div className="dialog-container transfer-dialog">
                <div className="dialog-header">
                  <h3>Transfer Ownership</h3>
                </div>
                <div className="dialog-content">
                  <p>Select an admin to transfer ownership of "{selectedBookBox.name}" to:</p>
                  
                  {/* Search Bar */}
                  <div className="admin-search">
                    <input
                      type="text"
                      placeholder="Search admins by name or username..."
                      value={adminSearchQuery}
                      onChange={handleAdminSearch}
                      className="admin-search-input"
                    />
                  </div>

                  {/* Admin List */}
                  <div className="admin-list">
                    {filteredAdmins.length > 0 ? (
                      filteredAdmins.map((admin) => (
                        <div 
                          key={admin.username}
                          className="admin-item"
                          onClick={() => handleSelectAdmin(admin.username)}
                        >
                          <div className="admin-info">
                            <div className="admin-username">{admin.username}</div>
                            {admin.name && <div className="admin-name">{admin.name}</div>}
                          </div>
                          <div className="admin-select-icon">→</div>
                        </div>
                      ))
                    ) : (
                      <div className="no-admins">
                        {adminSearchQuery ? 'No admins found matching your search.' : 'No admins available.'}
                      </div>
                    )}
                  </div>
                </div>
                <div className="dialog-actions">
                  <button 
                    onClick={handleCloseTransferDialog}
                    className="cancel-button"
                    disabled={isTransferring}
                  >
                    Cancel
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

export default UpdateBookBoxPage
