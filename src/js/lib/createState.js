/*
 * createState - a simple state management function
 * I'm only tracking primitive types and array
 * not doing any deep comparison, keeping it really simple
 * @param {Array | String | Number | Boolean} initialState - the initial state
 */
export function createState(initialState) {
  let state = initialState
  let prevState = initialState
  const listeners = []

  return {
    /*
     * Get the current state
     * @return {Array | String | Number | Boolean} - the current state
     */
    get() {
      return state
    },
    /*
     * Set a new state
     * When a function is passed, the callback will receive the current state (prevState)
     * @param {Function | Array | String | Number | Boolean} newState - the new state
     */
    set(newState) {
      prevState = state

      if (typeof newState === 'function') {
        state = newState(state)
      } else {
        state = newState
      }

      listeners.forEach(listener => listener(state, prevState))
    },
    /*
     * Subscribe to state changes
     * @param {Function} listener - the callback to be called when the state changes
     * @return {Function} - the unsubscribe function
     */
    subscribe(listener) {
      listeners.push(listener)

      return () => {
        const index = listeners.indexOf(listener)
        listeners.splice(index, 1)
      }
    },
  }
}
