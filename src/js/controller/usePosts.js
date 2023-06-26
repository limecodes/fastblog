import { createState } from '../lib/createState.js'
import { getUrl, MIN_POSTS_COUNT } from '../lib/getUrl.js'
import { fetchPaginated } from '../lib/fetchPaginated.js'
import DataCache from '../lib/cache.js'

export function usePosts() {
  const posts = createState([])
  const loading = createState(false)
  const error = createState(null)
  const order = createState(null)
  const user = createState(null)
  // The initial next link is the first page
  const nextLink = createState(getUrl('/posts'))

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

  async function fetchFromNetwork(urlObject) {
    return await fetchPaginated(urlObject)
  }

  async function fetchFromCache(urlObject) {
    try {
      return await DataCache.get(urlObject)
    } catch (error) {
      console.error('Could not fetch from cache', error)
      return []
    }
  }

  async function fetchNextPosts() {
    if (nextLink.get()) {
      const newPosts = await fetchPosts(nextLink.get())

      if (newPosts.length) {
        posts.set(prevPosts => [...prevPosts, ...newPosts])
      }
    }
  }

  async function sortByTitle(direction) {
    if (direction) {
      order.set(direction)
    } else {
      order.set(null)
      resetPosts()
    }
  }

  async function sortByUser(userId) {
    if (userId) {
      user.set(userId)
    } else {
      user.set(null)
      resetPosts()
    }
  }

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

  async function resetFilters() {
    order.set(null)
    user.set(null)

    document.getElementById('sort-posts').value = ''
    document.getElementById('filter-users').value = ''

    const newPosts = await fetchPosts(getUrl('/posts'))
    posts.set(newPosts)
  }

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
