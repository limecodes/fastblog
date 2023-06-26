const SERVER_BASE = 'https://jsonplaceholder.typicode.com'

// minimum number of posts to fetch to fill page
const MIN_POSTS_COUNT = 3

/*
 * Returns the url object for the given endpoint
 * @param {String} endpoint - The plural endpoint to fetch from (e.g. /posts, /users)
 * @param {Object} options - The options to be passed to the url object
 * @param {Number} options.page - The page to fetch
 * @param {Number} options.limit - The limit of posts to fetch
 * @param {String} options.sort - The field to sort by (e.g. title)
 * @param {String} options.order - The order to sort by (e.g. asc, desc)
 * @return {URL} - The url object
 */
export function getUrl(endpoint, options = { page: 1, limit: MIN_POSTS_COUNT }) {
  const urlObject = new URL(`${SERVER_BASE}${endpoint}`)

  if (options) {
    const { page, limit, sort, order } = options
    if (page) urlObject.searchParams.set('_page', page)
    if (limit) urlObject.searchParams.set('_limit', limit)
    if (sort) urlObject.searchParams.set('_sort', sort)
    if (order) urlObject.searchParams.set('_order', order)
  }

  return urlObject
}
