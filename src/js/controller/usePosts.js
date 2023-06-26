import { createState } from '../lib/createState.js'
import { getUrl } from '../lib/getUrl.js'
import { fetchPaginated } from '../lib/fetchPaginated.js'

export function usePosts() {
  const posts = createState([])
  const loading = createState(false)
  const error = createState(null)
  // The initial next link is the first page
  const nextLink = createState(getUrl('/posts'))

  async function fetchPosts(urlObject) {
    loading.set(true)

    const { posts: paginatedPosts, next } = await fetchFromNetwork(urlObject)

    if (paginatedPosts.length) {
      loading.set(false)
      nextLink.set(next ? new URL(next) : null)

      return paginatedPosts
    } else {
      loading.set(false)
      return []
    }
  }

  async function fetchFromNetwork(urlObject) {
    return await fetchPaginated(urlObject)
  }

  fetchPosts(nextLink.get()).then(paginatedPosts => {
    posts.set(paginatedPosts)
  })

  return {
    posts,
    loading,
    error,
  }
}
