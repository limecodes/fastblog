const CACHE_NAME = 'dataCache'

class DataCache {
  constructor() {
    if (!DataCache.instance) {
      DataCache.instance = this
    }

    return DataCache.instance
  }

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

  async has(urlObject) {
    let data = await this.get(urlObject)
    return !!data
  }

  getKey(urlObject) {
    return `${urlObject.pathname}${urlObject.search}`
  }
}

const instance = new DataCache()

export default instance
