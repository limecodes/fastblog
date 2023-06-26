/*
 * Post Component - Represents a single post
 * @param {Object} post - The post object
 * @param {Number} post.userId - The user id
 * @param {String} post.title - The post title
 * @param {String} post.body - The post body
 * @returns {HTMLElement} - The post element
 * @example
 * const post = new Post({
 *  userId: 1,
 *  title: 'My Post',
 *  body: 'This is my post'
 * })
 */
export class Post {
  constructor({ userId, title, body }) {
    this.userId = userId
    this.title = title
    this.body = body

    return this.render()
  }

  /*
   * Creates the post title element
   * @returns {HTMLElement} - The title element
   */
  createTitle() {
    const titleElement = document.createElement('h2')
    titleElement.className = 'post-title'
    titleElement.textContent = this.title

    return titleElement
  }

  /*
   * Creates the post byline element
   * @returns {HTMLElement} - The byline element
   */
  createByLine() {
    const authorElement = document.createElement('strong')
    authorElement.innerText = `User ${this.userId}`

    const bylineElement = document.createElement('p')
    bylineElement.className = 'post-author'
    bylineElement.innerText = 'By: '
    bylineElement.appendChild(authorElement)

    return bylineElement
  }

  /*
   * Creates the post body element
   * @returns {HTMLElement} - The body element
   */
  createBody() {
    const bodyElement = document.createElement('p')
    bodyElement.className = 'post-body'
    bodyElement.innerText = this.body

    return bodyElement
  }

  /*
   * Renders the post element
   * @returns {HTMLElement} - The post element
   */
  render() {
    const postElement = document.createElement('div')
    postElement.className = 'post'

    postElement.appendChild(this.createTitle())
    postElement.appendChild(this.createByLine())
    postElement.appendChild(this.createBody())

    return postElement
  }
}
