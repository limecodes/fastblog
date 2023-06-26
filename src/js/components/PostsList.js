import { Post } from './Post.js'

/*
 * Creates the post list element
 * @param {Array} posts - The posts to render
 * @param posts[].id - The post id
 * @param posts[].userId - The user id
 * @param posts[].title - The post title
 * @param posts[].body - The post body
 * @param {Function} fetchNextPosts - The function to fetch the next posts
 * @example
 * const postsList = new PostsList(posts, fetchNextPosts)
 */
export class PostsList {
  constructor(posts, fetchNextPosts) {
    this.postsRoot = document.getElementById('posts')
    this.fetchNextPosts = fetchNextPosts
    this.sentinelElement = document.createElement('div')
    this.sentinelElement.id = 'sentinel'

    this.setupObserver()
    posts.subscribe(this.render.bind(this))
  }

  /*
   * Sets up the intersection observer
   */
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

  /*
   * Clears the posts list, used when re-rendering
   */
  clearPosts() {
    while (this.postsRoot.firstChild) {
      this.postsRoot.removeChild(this.postsRoot.firstChild)
    }
  }

  /*
   * Renders the posts list
   * @param {Array} posts - The posts to render
   */
  render(posts) {
    this.clearPosts()

    posts.forEach(({ id, userId, title, body }) => {
      this.postsRoot.appendChild(new Post({ userId, title: `${id}: ${title}`, body }))
    })

    this.postsRoot.appendChild(this.sentinelElement)
  }
}
