export class Users {
  constructor(users) {
    this.users = users
    this.usersRoot = document.getElementById('filter-users')
    users.subscribe(this.render.bind(this))
  }

  createUserOption({ id, username }) {
    const optionElement = document.createElement('option')
    optionElement.className = 'user-option'
    optionElement.value = id
    optionElement.innerText = `${username} (ID: ${id})`

    return optionElement
  }

  render() {
    const users = this.users.get()

    users.forEach((user) => {
      this.usersRoot.appendChild(this.createUserOption(user))
    })
  }
}