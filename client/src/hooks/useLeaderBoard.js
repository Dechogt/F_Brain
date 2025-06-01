import { useState, useEffect } from 'react'
import axios from 'axios'

const useLeaderboard = (gameFilter) => {
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true)
        const { data } = await axios.get(`/api/leaderboard?game=${gameFilter}`)
        setPlayers(data.map((player, index) => ({
          ...player,
          rank: index + 1,
          id: player._id
        })))
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }   

    fetchLeaderboard()
  }, [gameFilter])

  return { players, loading, error }
}

export default useLeaderboard