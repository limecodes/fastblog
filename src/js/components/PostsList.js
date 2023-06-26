import { Post } from './Post.js'

export class PostsList {
  constructor(posts) {
    this.postsRoot = document.getElementById('posts')
    this.sentinelElement = document.createElement('div')
    this.sentinelElement.id = 'sentinel'

    posts.subscribe(this.render.bind(this))
  }

  clearPosts() {
    while (this.postsRoot.firstChild) {
      this.postsRoot.removeChild(this.postsRoot.firstChild)
    }
  }

  render(posts) {
    this.clearPosts()

    posts.forEach(({ id, userId, title, body }) => {
      this.postsRoot.appendChild(new Post({ userId, title, body }))
    })

    this.postsRoot.appendChild(this.sentinelElement)
  }
}
