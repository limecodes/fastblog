/*
 * Fetches paginated data from the API
 * @param {Object} urlObject - The url object to fetch from as I'm manipulating the search params
 * @return {Promise<PostResponse>} - The response from the API with next link
 */
export async function fetchPaginated(urlObject) {
  try {
    const response = await fetch(urlObject)
    // Don't forget that next link can be undefined
    const { next } = parseLinkHeader(response.headers.get('Link'))

    const posts = await response.json()

    return {
      posts,
      next,
    }
  } catch (error) {
    console.error('Could not fetch posts from API', error)
    return {
      posts: [],
      link: null,
    }
  }
}

/*
 * Parses the link header from the API
 * @param {String} linkHeader - The link header from the API
 * @return {Object} - The parsed link header
 */
function parseLinkHeader() {
  // JSON Placeholder API gives unsecure links in Link header
  // so we need to make sure we use the same protocol as the current page
  const currentProtocol = window.location.protocol

  return parseLinkHeader.split(', ').reduce((acc, link) => {
    const match = link.match(/<(.*)>; rel="(.*)"/)

    if (match) {
      // Converting to URL object to set the protocol
      const url = new URL(match[1])
      url.protocol = currentProtocol

      const rel = match[2]
      // Converting back to string because later we're caching it
      // to IndexedDB and URL object is not supported there
      acc[rel] = url.toString()
    }
  })
}
