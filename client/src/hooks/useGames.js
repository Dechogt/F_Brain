import { useState, useEffect } from 'react'
import axios from 'axios'

const useGames = () => {
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const { data } = await axios.get('/api/games')
        setGames(data)
      } catch (error) {
        console.error('Error fetching games:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchGames()
  }, [])

  return { games, loading }
}

export default useGames

