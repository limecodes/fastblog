import { createState } from '../lib/createState.js'
import { getUrl, MIN_POSTS_COUNT } from '../lib/getUrl.js'
import { fetchPaginated } from '../lib/fetchPaginated.js'
import DataCache from '../lib/cache.js'

/*
 * This controller is responsible for the control logic for posts
 * @returns {Object} - The posts and control functions
 * @return {Array} posts - The posts
 * @return {Boolean} loading - Whether the posts are loading
 * @return {String} error - The error message
 * @return {Function} fetchNextPosts - The function to fetch the next paginated posts
 * @return {Function} sortByTitle - The function to sort the posts by title
 * @return {Function} sortByUser - The function to sort the posts by user
 * @return {Function} resetFilters - The function to reset the filters and post list
 * @example
 * const { posts, loading, error, fetchNextPosts, sortByTitle, sortByUser, resetFilters } = usePosts()
 */
export function usePosts() {
  const posts = createState([])
  const loading = createState(false)
  const error = createState(null)
  const order = createState(null)
  const user = createState(null)
  const nextLink = createState(getUrl('/posts'))

  /*
   * Fetches the paginated posts - Proxy function to fetch the posts from the cache or network
   * @param {URL} urlObject - The URL object
   * @returns {Array} - The posts
   */
  async function fetchPosts(urlObject) {
    const cacheHit = await DataCache.has(urlObject)

    loading.set(true)

    const fetchMethod = cacheHit ? fetchFromCache : fetchFromNetwork
    const { posts: paginatedPosts, next } = await fetchMethod(urlObject)

    if (paginatedPosts.length) {
      loading.set(false)
      nextLink.set(next ? new URL(next) : null)

      DataCache.set(urlObject, {
        posts: paginatedPosts,
        next,
      })

      return paginatedPosts
    } else {
      loading.set(false)
      return []
    }
  }

  /*
   * Fetches the paginated posts from the network
   * @param {URL} urlObject - The URL object
   * @returns {Array} - The posts
   */
  async function fetchFromNetwork(urlObject) {
    return await fetchPaginated(urlObject)
  }

  /*
   * Fetches the paginated posts from the cache
   * @param {URL} urlObject - The URL object
   * @returns {Array} - The posts
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
   * Callback function to fetch the next paginated posts
   */
  async function fetchNextPosts() {
    if (nextLink.get()) {
      const newPosts = await fetchPosts(nextLink.get())

      if (newPosts.length) {
        posts.set(prevPosts => [...prevPosts, ...newPosts])
      }
    }
  }

  /*
   * Callback function to sort the posts by title
   */
  async function sortByTitle(direction) {
    if (direction) {
      order.set(direction)
    } else {
      order.set(null)
      resetPosts()
    }
  }

  /*
   * Callback function to sort the posts by user
   */
  async function sortByUser(userId) {
    if (userId) {
      user.set(userId)
    } else {
      user.set(null)
      resetPosts()
    }
  }

  /*
   * Callback function to reset the posts
   */
  async function resetPosts() {
    const userId = user.get()
    const direction = order.get()
    const sortParams = direction ? { sort: 'title', order: direction } : {}
    const endpoint = userId ? `/users/${userId}/posts` : '/posts'

    const newPosts = await fetchPosts(getUrl(endpoint), {
      page: 1,
      limit: MIN_POSTS_COUNT,
      ...sortParams,
    })
    posts.set(newPosts)
  }

  /*
   * Callback function to reset the filters
   */
  async function resetFilters() {
    order.set(null)
    user.set(null)

    document.getElementById('sort-posts').value = ''
    document.getElementById('filter-users').value = ''

    const newPosts = await fetchPosts(getUrl('/posts'))
    posts.set(newPosts)
  }

  /*
   * Subscribe to the order and re-fetch the posts when the order changes
   * taking into account the user filter
   */
  order.subscribe(async (direction, prevDirection) => {
    let newPosts = []
    const userId = user.get()
    const endpoint = userId ? `/users/${userId}/posts` : '/posts'

    if (prevDirection !== direction && direction !== null) {
      nextLink.set(null)
      newPosts = await fetchPosts(
        getUrl(endpoint, { page: 1, limit: MIN_POSTS_COUNT, sort: 'title', order: direction }),
      )

      posts.set(newPosts)
    }
  })

  /*
   * Subscribe to the user and re-fetch the posts when the user changes
   * taking into account the order filter
   */
  user.subscribe(async (userId, prevUserId) => {
    let newPosts = []

    if (prevUserId !== userId && userId !== null) {
      const direction = order.get()
      const sortParams = direction ? { sort: 'title', order: direction } : {}

      nextLink.set(null)
      newPosts = await fetchPosts(
        getUrl(`/users/${userId}/posts`, { page: 1, limit: MIN_POSTS_COUNT, ...sortParams }),
      )

      posts.set(newPosts)
    }
  })

  /*
   * The initial fetch of the posts
   */
  fetchPosts(nextLink.get()).then(paginatedPosts => {
    posts.set(paginatedPosts)
  })

  return {
    posts,
    loading,
    error,
    fetchNextPosts,
    sortByTitle,
    sortByUser,
    resetFilters,
  }
}
