import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authAPI, adminAPI, tokenService } from '../../services/api'
import logo from '../../assets/logo.png'
import './Login.css'

function Login() {
  const [identifier, setIdentifier] = useState('') 
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Step 1: Try to log in with identifier+password
      const data = await authAPI.login(identifier, password)
      
      if (data.token) {
        tokenService.setToken(data.token)
        
        // Step 2: Check admin status with the token
        try {
          const isAdmin = await adminAPI.checkAdmin()
          
          if (isAdmin) {
            // User is admin, allow access

            // If user is super admin, redirect to super admin page
            if (identifier === import.meta.env.VITE_SUPER_ADMIN_USERNAME) {
              navigate('/super-admin')
            } else {
              navigate('/main')
            }
          } else {
            // User is not admin, prevent access
            tokenService.removeToken() // Clear the token
            setError('You do not have admin privileges. Please contact the admin of Lino to make you a fellow admin.')
          }
        } catch (adminError) {
          // If we can't check admin status, prevent access
          tokenService.removeToken() // Clear the token
          setError('Unable to verify admin status. Please contact the admin of Lino to make you a fellow admin.')
        }
      } else {
        setError('The identifier or password is invalid.')
      }
    } catch (err) {
      // Login failed
      setError('The identifier or password is invalid.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-form">
        <img src={logo} alt="Lino Logo" className="logo" />
        <h1 className="title">Lino admin page</h1>
        
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <input
              type="text"
              placeholder="Username or Email"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              className="form-input"
            />
          </div>
          
          <div className="form-group">
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="form-input password-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle-button"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <svg 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                >
                  {showPassword ? (
                    // Eye slash (hidden)
                    <>
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </>
                  ) : (
                    // Eye (visible)
                    <>
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </>
                  )}
                </svg>
              </button>
            </div>
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <button type="submit" disabled={loading} className="login-button">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login
