import { Post } from './Post.js'

export class PostsList {
  constructor(posts, fetchNextPosts) {
    this.postsRoot = document.getElementById('posts')
    this.fetchNextPosts = fetchNextPosts
    this.sentinelElement = document.createElement('div')
    this.sentinelElement.id = 'sentinel'

    this.setupObserver()
    posts.subscribe(this.render.bind(this))
  }

  setupObserver() {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.fetchNextPosts()
        }
      })
    })

    observer.observe(this.sentinelElement)
  }

  clearPosts() {
    while (this.postsRoot.firstChild) {
      this.postsRoot.removeChild(this.postsRoot.firstChild)
    }
  }

  render(posts) {
    this.clearPosts()

    posts.forEach(({ id, userId, title, body }) => {
      this.postsRoot.appendChild(new Post({ userId, title: `${id}: ${title}`, body }))
    })

    this.postsRoot.appendChild(this.sentinelElement)
  }
}
