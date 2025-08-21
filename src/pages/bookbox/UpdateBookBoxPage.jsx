import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Wrapper } from '@googlemaps/react-wrapper'
import { bookboxesAPI, qrCodeAPI, adminAPI } from '../../services/api'
import { 
  FiCamera, 
  FiPower, 
  FiUserCheck, 
  FiTrash2, 
  FiDownload,
  FiX,
  FiSearch,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi'
import AdminHeader from '../../components/ui/AdminHeader/AdminHeader'
import PageHeader from '../../components/ui/PageHeader/PageHeader'
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
  const [adminSearchQuery, setAdminSearchQuery] = useState('')
  const [adminPagination, setAdminPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalResults: 0,
    hasNextPage: false,
    hasPrevPage: false,
    limit: 8
  })
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
      const qrBlob = await qrCodeAPI.createQR('https://ceduni-lino.netlify.app/bookbox/' + selectedBookBox._id.toString())
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

  // Fetch admins with pagination
  const fetchAdmins = async (query = '', page = 1) => {
    setIsLoadingAdmins(true)
    try {
      const response = await adminAPI.searchAdmins(query, adminPagination.limit, page)
      setAdmins(response.admins || [])
      setAdminPagination(response.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalResults: 0,
        hasNextPage: false,
        hasPrevPage: false,
        limit: 8
      })
    } catch (err) {
      setError(err.message)
      console.error('Error fetching admins:', err)
    } finally {
      setIsLoadingAdmins(false)
    }
  }

  const handleTransferOwnership = async () => {
    if (!selectedBookBox) return

    setError('')
    setAdminSearchQuery('')
    setAdminPagination(prev => ({ ...prev, currentPage: 1 }))
    setShowTransferDialog(true)
    
    // Fetch initial admin list
    await fetchAdmins('', 1)
  }

  const handleAdminSearch = async (e) => {
    const query = e.target.value
    setAdminSearchQuery(query)
    
    // Reset to first page when searching
    setAdminPagination(prev => ({ ...prev, currentPage: 1 }))
    
    // Fetch admins with search query
    await fetchAdmins(query, 1)
  }

  const handleAdminPageChange = async (newPage) => {
    if (newPage >= 1 && newPage <= adminPagination.totalPages) {
      setAdminPagination(prev => ({ ...prev, currentPage: newPage }))
      await fetchAdmins(adminSearchQuery, newPage)
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
    setAdminSearchQuery('')
    setAdminPagination({
      currentPage: 1,
      totalPages: 1,
      totalResults: 0,
      hasNextPage: false,
      hasPrevPage: false,
      limit: 8
    })
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
        <AdminHeader />
        <PageHeader title="Loading..." />
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
        <AdminHeader />
        <PageHeader title="Error" />
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
      <AdminHeader />
      <PageHeader title={`Update: ${selectedBookBox?.name}`} onBack={handleBackToDetail} />

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
                      <FiCamera className="upload-icon" />
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
                <FiCamera /> {isGeneratingQr ? 'Generating QR...' : 'Generate QR Code'}
              </button>
              <button 
                type="button" 
                onClick={handleToggleActivation}
                className={selectedBookBox.isActive ? "deactivate-button" : "activate-button"}
                disabled={isToggling}
              >
                <FiPower /> {isToggling ? 'Processing...' : (selectedBookBox.isActive ? 'Deactivate' : 'Activate')}
              </button>
              <button 
                type="button" 
                onClick={handleTransferOwnership}
                className="transfer-button"
                disabled={isLoadingAdmins}
              >
                <FiUserCheck /> {isLoadingAdmins ? 'Loading...' : 'Transfer Ownership'}
              </button>
              <button 
                type="button" 
                onClick={handleDeleteBookBox}
                className="delete-button"
                disabled={isUpdating}
              >
                <FiTrash2 /> Delete Book Box
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
                    <FiDownload /> Download QR Code
                  </button>
                  <button onClick={handleCloseQR} className="close-qr-button">
                    <FiX /> Close
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

                  {/* Admin List Header */}
                  {!isLoadingAdmins && (
                    <div className="admin-list-header">
                      <p>Showing {admins.length} of {adminPagination.totalResults} admins</p>
                    </div>
                  )}

                  {/* Admin List */}
                  <div className="admin-list">
                    {isLoadingAdmins ? (
                      <div className="admin-loading">
                        <p>Loading admins...</p>
                      </div>
                    ) : admins.length > 0 ? (
                      admins.map((admin) => (
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

                  {/* Admin Pagination */}
                  {!isLoadingAdmins && adminPagination.totalPages > 1 && (
                    <div className="admin-pagination">
                      <button 
                        className="admin-pagination-btn"
                        onClick={() => handleAdminPageChange(adminPagination.currentPage - 1)}
                        disabled={!adminPagination.hasPrevPage}
                      >
                        <FiChevronLeft /> Previous
                      </button>
                      
                      <div className="admin-pagination-info">
                        <span>Page {adminPagination.currentPage} of {adminPagination.totalPages}</span>
                      </div>
                      
                      <button 
                        className="admin-pagination-btn"
                        onClick={() => handleAdminPageChange(adminPagination.currentPage + 1)}
                        disabled={!adminPagination.hasNextPage}
                      >
                        Next <FiChevronRight />
                      </button>
                    </div>
                  )}
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
