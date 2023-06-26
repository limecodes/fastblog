import { createState } from '../lib/createState.js'
import { getUrl } from '../lib/getUrl.js'
import DataCache from '../lib/cache.js'

/*
 * There will always be 10 users using the JSON Placeholder API
 * but let's limit the number of users to 10 anyway
 * to avoid fetching too much data (just in case)
 */
const MAX_USERS_COUNT = 10

/*
 * The endpoint to fetch the users, with the default page and limit
 * as a URL object
 */
const getUsersUrlObject = getUrl('/users', { page: 1, limit: MAX_USERS_COUNT })

/*
 * This controller is responsible for the user logic
 * @returns {Object} - The users and control functions
 * @return {Array} users - The users
 * @return {Boolean} loading - Whether the users are loading
 * @return {String} error - The error message
 */
export function useUsers() {
  const users = createState([])
  const loading = createState(false)
  const error = createState(null)

  /*
   * Fetches the users - The proxy function to fetch the users from the cache or network
   * @param {URL} urlObject - The URL object
   * @returns {Array} - The users
   */
  async function fetchUsers(urlObject) {
    const cacheHit = await DataCache.has(urlObject)

    loading.set(true)
    const fetchMethod = cacheHit ? fetchFromCache : fetchFromNetwork
    const fetchedUsers = await fetchMethod(urlObject)

    return fetchedUsers
  }

  /*
   * Fetches the users from the cache
   * @param {URL} urlObject - The URL object
   * @returns {Array} - The users or an empty array
   */
  async function fetchFromCache(urlObject) {
    try {
      return await DataCache.get(urlObject)
    } catch (error) {
      console.error('Could not fetch from cache', error)
      return []
    }
  }

  /*
   * Fetches the users from the network
   * @param {URL} urlObject - The URL object
   * @returns {Array} - The users or an empty array
   */
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

  /*
   * The initial fetch of the users
   */
  fetchUsers(getUsersUrlObject).then(fetchedUsers => {
    users.set(fetchedUsers)
  })

  return {
    users,
    loading,
    error,
  }
}
