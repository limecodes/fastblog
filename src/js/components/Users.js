/*
 * Renders the users in the user filter
 * @param {Array} users - The users to render
 * @param users[].id - The user id
 * @param users[].username - The user username
 * @example
 * const users = new Users(users)
 */
export class Users {
  constructor(users) {
    this.users = users
    this.usersRoot = document.getElementById('filter-users')
    users.subscribe(this.render.bind(this))
  }

  /*
   * Creates a user option element
   * @param {Object} user - The user to render
   */
  createUserOption({ id, username }) {
    const optionElement = document.createElement('option')
    optionElement.className = 'user-option'
    optionElement.value = id
    optionElement.innerText = `${username} (ID: ${id})`

    return optionElement
  }

  /*
   * Renders the users in the user filter
   * @param {Array} users - The users to render
   */
  render() {
    const users = this.users.get()

    users.forEach(user => {
      this.usersRoot.appendChild(this.createUserOption(user))
    })
  }
}
