export class Post {
  constructor({ userId, title, body }) {
    this.userId = userId
    this.title = title
    this.body = body

    return this.render()
  }

  createTitle() {
    const titleElement = document.createElement('h2')
    titleElement.className = 'post-title'
    titleElement.textContent = this.title

    return titleElement
  }

  createByLine() {
    const authorElement = document.createElement('strong')
    authorElement.innerText = `User ${this.userId}`

    const bylineElement = document.createElement('p')
    bylineElement.className = 'post-author'
    bylineElement.innerText = 'By: '
    bylineElement.appendChild(authorElement)

    return bylineElement
  }

  createBody() {
    const bodyElement = document.createElement('p')
    bodyElement.className = 'post-body'
    bodyElement.innerText = this.body

    return bodyElement
  }

  render() {
    const postElement = document.createElement('div')
    postElement.className = 'post'

    postElement.appendChild(this.createTitle())
    postElement.appendChild(this.createByLine())
    postElement.appendChild(this.createBody())

    return postElement
  }
}
