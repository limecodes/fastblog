import { PostsList } from './components/PostsList.js'
import { usePosts } from './controller/usePosts.js'

document.addEventListener('DOMContentLoaded', () => {
  const { posts } = usePosts()

  new PostsList(posts)
})
