import { useNavigate } from 'react-router-dom'
import { FiArrowLeft } from 'react-icons/fi'
import './PageHeader.css'

function PageHeader({ title, onBack }) {
  const navigate = useNavigate()

  const handleBack = () => {
    if (onBack) {
      onBack() 
    } else {
      navigate(-1) // Go back to previous page
    }
  }

  return (
    <div className="page-header">
      <div className="page-header-content">
        <button onClick={handleBack} className="back-button">
          <FiArrowLeft />
          <span>Back</span>
        </button>
        {title && <h2 className="page-title">{title}</h2>}
      </div>
    </div>
  )
}

export default PageHeader
