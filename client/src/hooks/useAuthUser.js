import { useEffect, useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import axios from 'axios'

const useAuthUser = () => {
  const { user, isAuthenticated, getAccessTokenSilently } = useAuth0()
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserData = async () => {
      if (!isAuthenticated) {
        setLoading(false)
        return
      }

      try {
        const token = await getAccessTokenSilently()
        const { data } = await axios.get('/api/user', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        setUserData(data)
      } catch (error) {
        console.error('Error fetching user data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [isAuthenticated, user?.sub, getAccessTokenSilently])

  return { 
    user: { ...user, ...userData }, 
    isAuthenticated, 
    loading 
  }
}

export default useAuthUser