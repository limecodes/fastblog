import { createState } from '../lib/createState.js'
import { getUrl } from '../lib/getUrl.js'

const MAX_USERS_COUNT = 10

export function useUsers() {
  const users = createState([])
  const loading = createState(false)
  const error = createState(null)

  async function fetchUsers() {
    try {
      const response = await fetch(getUrl('/users', { page: 1, limit: MAX_USERS_COUNT }))
      const users = await response.json()

      if (users.length) {
        return users
      }
    } catch (error) {
      console.error('Could not fetch users', error)
      error.set(error)
    }
  }

  fetchUsers().then(fetchedUsers => {
    users.set(fetchedUsers)
  })

  return {
    users,
    loading,
    error,
  }
}
