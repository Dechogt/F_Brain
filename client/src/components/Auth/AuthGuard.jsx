import { useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
// import { useNavigate } from 'react-router-dom'
import LoadingSpinner from '../..LoadingSpinner/'


const AuthGuard = ({ children }) => {
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0()
  // const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      loginWithRedirect({
        appState: { returnTo: window.location.pathname }
      })
    }
  }, [isAuthenticated, isLoading, loginWithRedirect])

  if (isLoading) {
    return <LoadingSpinner />
  }

  return isAuthenticated ? children : null
}

export default AuthGuard