import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Wrapper } from '@googlemaps/react-wrapper'
import { bookboxesAPI, qrCodeAPI } from '../../services/api'
import { FiCamera, FiDownload, FiCheck, FiEdit2, FiBook, FiMapPin, FiSave, FiX } from 'react-icons/fi'
import AdminHeader from '../../components/ui/AdminHeader/AdminHeader'
import PageHeader from '../../components/ui/PageHeader/PageHeader'
import '../MainPage/SubPage.css'
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
  const [isTitleEditable, setIsTitleEditable] = useState(false)
  const [isDescriptionEditable, setIsDescriptionEditable] = useState(false)
  const [tempTitle, setTempTitle] = useState('')
  const [tempDescription, setTempDescription] = useState('')
  const [books, setBooks] = useState([]) // Placeholder books
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
          setShouldCenterMap(true)
        },
        (error) => {
          console.warn('Could not get user location:', error)
        }
      )
    }

    // Initialize with placeholder books
    setBooks([
      { 
        id: 1, 
        title: 'Notes d\'un souterrain', 
        author: 'Fedor Mikhailovich Dostoev...', 
        dateAdded: '2 months ago',
        cover: null
      },
      { 
        id: 2, 
        title: 'The Design of Everyday Things', 
        author: 'Don Norman', 
        dateAdded: '1 month ago',
        cover: 'https://images-na.ssl-images-amazon.com/images/I/410RTQezHYL._SX326_BO1,204,203,200_.jpg'
      },
      { 
        id: 3, 
        title: 'Clean Code', 
        author: 'Robert C. Martin', 
        dateAdded: '3 weeks ago',
        cover: null
      }
    ])
  }, [])

  const handleTitleEdit = () => {
    setTempTitle(formData.title)
    setIsTitleEditable(true)
  }

  const handleTitleSave = () => {
    setFormData(prev => ({ ...prev, title: tempTitle }))
    setIsTitleEditable(false)
  }

  const handleTitleCancel = () => {
    setTempTitle('')
    setIsTitleEditable(false)
  }

  const handleDescriptionEdit = () => {
    setTempDescription(formData.infoText)
    setIsDescriptionEditable(true)
  }

  const handleDescriptionSave = () => {
    setFormData(prev => ({ ...prev, infoText: tempDescription }))
    setIsDescriptionEditable(false)
  }

  const handleDescriptionCancel = () => {
    setTempDescription('')
    setIsDescriptionEditable(false)
  }

  const handleDownloadQR = () => {
    if (qrCodeData && createdBookBoxName) {
      const filename = `${createdBookBoxName.replace(/[^a-zA-Z0-9]/g, '_')}_QR_code.png`
      qrCodeAPI.downloadBlob(qrCodeData, filename)
    }
  }

  const handleContinueToMain = () => {
    setShowQrCode(false)
    setQrCodeData(null)
    setQrCodeUrl(null)
    setCreatedBookBoxName('')
    navigate('/main')
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
      const qrBlob = await qrCodeAPI.createQR('https://ceduni-lino.netlify.app/bookbox/' + response._id.toString())
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
    <div className="brown-theme">
      <AdminHeader />
      
      <div className="phone-container">
        {/* Title Section with Edit - Now inside phone container */}
        <div className="title-section">
          <div className="title-container">
            {isTitleEditable ? (
              <div className="title-edit-container">
                <input
                  type="text"
                  value={tempTitle}
                  onChange={(e) => setTempTitle(e.target.value)}
                  className="title-input"
                  placeholder="Enter book box title"
                  autoFocus
                />
                <div className="edit-actions">
                  <button onClick={handleTitleSave} className="save-btn">
                    <FiSave />
                  </button>
                  <button onClick={handleTitleCancel} className="cancel-btn">
                    <FiX />
                  </button>
                </div>
              </div>
            ) : (
              <div className="title-display">
                <h1 className="page-title">
                  {formData.title || 'New Book Box'}
                </h1>
                <button 
                  className="edit-title-btn"
                  onClick={handleTitleEdit}
                  type="button"
                >
                  <FiEdit2 />
                </button>
              </div>
            )}
          </div>
        </div>

        <main className="subpage-main">
          <div className="subpage-content">
            {error && <div className="error-message">{error}</div>}
            
            {/* First Container - Book Box Details */}
            <div className="bookbox-details-container">
              
              {/* Image Section */}
              <div className="image-section">
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
                      <div className="image-preview-container">
                        <img src={imagePreview} alt="Preview" className="image-preview" />
                        <div className="image-overlay">
                          <FiEdit2 className="edit-image-icon" />
                        </div>
                      </div>
                    ) : (
                      <div className="upload-placeholder">
                        <FiCamera className="upload-icon" />
                        <p>Tap to add photo</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Map Section */}
              <div className="map-section">
                <div className="map-wrapper">
                  <Wrapper apiKey={import.meta.env.VITE_GMAPS_API_KEY}>
                    <MapComponent />
                  </Wrapper>
                </div>
              </div>

              {/* Description Section */}
              <div className="description-section">
                {isDescriptionEditable ? (
                  <div className="description-edit-container">
                    <textarea
                      value={tempDescription}
                      onChange={(e) => setTempDescription(e.target.value)}
                      placeholder="Go to the Université de Montréal. Enter the Claire McNicoll building from the west door and the book box will be right in front of you."
                      className="description-textarea"
                      rows="4"
                    />
                    <div className="edit-actions">
                      <button onClick={handleDescriptionSave} className="save-btn">
                        <FiSave />
                      </button>
                      <button onClick={handleDescriptionCancel} className="cancel-btn">
                        <FiX />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="description-display" onClick={handleDescriptionEdit}>
                    <FiMapPin className="location-icon" />
                    <p className="description-text">
                      {formData.infoText || "Go to the Université de Montréal. Enter the Claire McNicoll building from the west door and the book box will be right in front of you."}
                    </p>
                    <FiEdit2 className="edit-description-icon" />
                  </div>
                )}
              </div>
            </div>

            {/* Second Container - Books Available */}
            <div className="books-container">
              <div className="books-header">
                <FiBook className="books-icon" />
                <h3>Books Available</h3>
                <span className="books-count">{books.length}</span>
              </div>
              
              <div className="books-grid">
                {books.map((book) => (
                  <div key={book.id} className="book-card">
                    <div className="book-cover">
                      {book.cover ? (
                        <img src={book.cover} alt={book.title} className="book-cover-image" />
                      ) : (
                        <div className="book-cover-placeholder">
                          <FiBook className="book-placeholder-icon" />
                        </div>
                      )}
                    </div>
                    <div className="book-info">
                      <h4 className="book-title">{book.title}</h4>
                      <p className="book-author">{book.author}</p>
                      <p className="book-date">Added {book.dateAdded}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <form onSubmit={handleSubmit}>
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
                  <FiCheck /> Book box "{createdBookBoxName}" created successfully!
                </div>
                <div className="qr-content">
                  <h3>QR Code Generated</h3>
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
                    <button onClick={handleContinueToMain} className="continue-button">
                      Continue to Main
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default RegisterBookBox