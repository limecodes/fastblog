const CACHE_NAME = 'dataCache'

/*
 * DataCache is a simple wrapper around IndexedDB.
 * This allows me to cache data and retrieve it, bypassing network requests
 * when the data is already cached.
 * This can be done by the service worker, but there's overhead in doing so.
 * as the service worker hooks into the fetch event.
 * It's also a separation of concerns where the service worker is for assets
 * and the DataCache is for data.
 * @returns {Object} - The DataCache instance
 */
class DataCache {
  constructor() {
    if (!DataCache.instance) {
      DataCache.instance = this
    }

    return DataCache.instance
  }

  /*
   * Initializes the IndexedDB database
   */
  async init() {
    let openRequest = indexedDB.open(CACHE_NAME, 1)

    openRequest.onupgradeneeded = () => {
      let db = openRequest.result
      db.createObjectStore(CACHE_NAME, { keyPath: 'id' })
    }

    return new Promise((resolve, reject) => {
      openRequest.onsuccess = () => {
        this.db = openRequest.result
        resolve()
      }
      openRequest.onerror = () => reject(openRequest.error)
    })
  }

  /*
   * Gets the data from the cache by the url path and search
   * @param {Object} urlObject - The url object
   * @returns {Object} - The data
   */
  get(urlObject) {
    const key = this.getKey(urlObject)

    let transaction = this.db.transaction(CACHE_NAME, 'readonly')
    let store = transaction.objectStore(CACHE_NAME)
    let request = store.get(key)

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        if (request.result && request.result.value) {
          resolve(request.result.value)
        } else {
          resolve(null)
        }
      }
      request.onerror = () => reject(request.error)
    })
  }

  /*
   * Sets the data in the cache by the url path and search
   * @param {Object} urlObject - The url object
   * @param {Object} value - The data
   */
  set(urlObject, value) {
    const key = this.getKey(urlObject)

    let transaction = this.db.transaction(CACHE_NAME, 'readwrite')
    let store = transaction.objectStore(CACHE_NAME)
    let request = store.put({ id: key, value })

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  /*
   * Checks if the data is in the cache by the url path and search
   * @param {Object} urlObject - The url object
   * @returns {Boolean} - Whether the data is in the cache
   */
  async has(urlObject) {
    let data = await this.get(urlObject)
    return !!data
  }

  /*
   * Gets the key from the url object
   * @param {Object} urlObject - The url object
   * @returns {String} - The key
   */
  getKey(urlObject) {
    return `${urlObject.pathname}${urlObject.search}`
  }
}

/*
 * Singleton instance
 */
const instance = new DataCache()

export default instance
