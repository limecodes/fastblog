import { PostsList } from './components/PostsList.js'
import { Users } from './components/Users.js'
import { usePosts } from './controller/usePosts.js'
import { useUsers } from './controller/useUsers.js'
import DataCache from './lib/cache.js'

document.addEventListener('DOMContentLoaded', async () => {
  await DataCache.init()
  const { users } = useUsers()
  const { posts, fetchNextPosts, sortByTitle, sortByUser, resetFilters } = usePosts()

  document
    .getElementById('sort-posts')
    .addEventListener('change', ({ target }) => sortByTitle(target.value))

  document
    .getElementById('filter-users')
    .addEventListener('change', ({ target }) => sortByUser(target.value))

  document.getElementById('reset-filters').addEventListener('click', () => resetFilters())

  new Users(users)
  new PostsList(posts, fetchNextPosts)
})
