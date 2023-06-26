import { createState } from '../lib/createState.js'
import { getUrl } from '../lib/getUrl.js'
import DataCache from '../lib/cache.js'

const MAX_USERS_COUNT = 10

const getUsersUrlObject = getUrl('/users', { page: 1, limit: MAX_USERS_COUNT })

export function useUsers() {
  const users = createState([])
  const loading = createState(false)
  const error = createState(null)

  async function fetchUsers(urlObject) {
    const cacheHit = await DataCache.has(urlObject)

    loading.set(true)
    const fetchMethod = cacheHit ? fetchFromCache : fetchFromNetwork
    const fetchedUsers = await fetchMethod(urlObject)

    return fetchedUsers
  }

  async function fetchFromCache(urlObject) {
    try {
      return await DataCache.get(urlObject)
    } catch (error) {
      console.error('Could not fetch from cache', error)
      return []
    }
  }

  async function fetchFromNetwork(urlObject) {
    try {
      const response = await fetch(urlObject)
      const fetchedUsers = await response.json()

      if (fetchedUsers.length) {
        DataCache.set(urlObject, fetchedUsers)
        return fetchedUsers
      }
    } catch (error) {
      console.error('Could not fetch users', error)
      error.set(error)
      return []
    }
  }

  fetchUsers(getUsersUrlObject).then(fetchedUsers => {
    users.set(fetchedUsers)
  })

  return {
    users,
    loading,
    error,
  }
}
