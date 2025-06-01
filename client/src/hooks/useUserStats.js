import { useState, useEffect } from 'react'
import axios from 'axios'

const useUserStats = (userId) => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!userId) return

    const fetchStats = async () => {
      try {
        setLoading(true)
        const { data } = await axios.get(`/api/users/${userId}/stats`)
        setStats(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [userId])

  return { stats, loading, error }
}

export default useUserStats