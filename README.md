# Fast Blog
Building a fast loading blog

## Running this application
*tl;dr*: `yarn && yarn start` or `npm install && npm run start` or [follow this link](https://netlify.com)

You can run the blog in the following ways:

*Local*
1. Clone this repo
1. Run `yarn && yarn start` or `npm install && npm run start` depending on which package manager you prefer
1. You should be able to open the application using the address: `http://localhost:3001`

> This step is required to setup a local server, this is required as serving the application from the `file://` protocol won't work
> This application uses a service worker to cache assets and calls a 3rd party API which isn't possible using the `file://` protocol.

However, you don't need to install the dev dependencies if you choose not to. Another way to run the application:

1. Clone this repo
1. Run `python3 -m http.server 3001`
1. Open the application at the address: `http://localhost:3001`

> This assumes that you have python installed

*Netlify*
If you don't have the pre-requisites to run the application locally,
you can simply view the application on [this netlify link](https://netlify.com)

## Browser Compatibility
*tl;dr*: Works on Chrome & Firefox up to versions Chrome 61 && Firefox 60

This application supports the latest version of Chrome & Firefox.

The following technical features are used:
- ES6: Supported back to Chrome 51 & Firefox 54
- Javascript modules via script tag: Supported back to Chrome 61 & Firefox 60
- Resource hints (module preload): Supported back to Chrome 66 & Firefox 115
- CSS Variables
- Web Audio API

## Technical Principles
- Load only what you need when you need it
- Let the API do the hard work

## Approach Walkthrough
My approach to this application is to have only what I need
at the time of loading.

I'm using [JSON Placeholder API](https://jsonplaceholder.typicode.com/) to load dummy blog posts
using the endpoint `/posts`.

However, I'm using the API's pagination features [documented here](https://github.com/typicode/json-server#plural-routes).

This is because of the following:
- If I request posts from the endpoint `/posts` without a limit then it has the potential of giving me everything it's got.
  This API only provides 100 posts, however since this is a 3rd party API, I don't have control over what it gives me on the `/posts` endpoint.
  There's nothing stopping this API from giving me 1000 posts or 1,000,000 posts. So I always want to set a limit on how much data I want to retrieve.

- I only want to receive the first 3 posts. When the user arrives on the blog page they might or might not scroll down to see more posts.
  The accent is on *might* so I only want to give them as much as to fill the first page on first load. Doing this allows me to minimise the
  amount of data that gets loaded upon the first visit. This allows for faster loading. Giving the user only what they need allows for faster loading.

This allows me to reduce the size of request upon first load which equals faster load time.

However, this means that:
- Upon scrolling I will need to load more posts from the API
- Keep track of the loaded posts and what posts to load next

So this adds a bit of technical overhead because this also means that I need to implement a data structure that allows me to
observe for changes to the posts and then adjust the DOM accordingly.

Also, I'm leveraging the API to do the sorting for me. Since I decided to load posts from the API as the user scrolls
this affects the logic to sort them.

If I sort the posts on the frontend for example `posts.sort((a, b) => ...)` then when the user scrolls, the posts will come in unsorted
and I will have to re-sort. This will result in incorrect order of posts especially if I need to apply a filter to sort by user id.

Therefore, I'm leveraging the API's sorting capability so that I can consistently get the correctly sorted posts. In other words
regarding sorting and filtering, I let the API do the hard work for me.

The drawback of this is that I need to do additional network requests when the user orders by title or by user id. However the advantage
is that I can depend on the API to give me consistent data.

Another drawback is that I need to load the author (user) data upfront. Otherwise, I wouldn't be able to filter by all the available authors
until I load all the posts.

## Technical Decisions
- No framework, vanilla JS
- Implement a simple state control

This project is simple enough to use an SPA (Single Page App) framework such as React, Vue, Svelte, Angular, etc...
It would have expedited the development given my design decisions. However I opted not to. If I chose to use React or Vue for example
then immediately the starting filesize of the application would be around 30 kB.

On top of the bare minimum of including a library, would be my assets (css, js, html) which would bring up the filesize to around 60 kB.

Based on my design decision I need a simple state management feature which can be implemented with very minimal code,
so no need for a fully fledged SPA library. If this were a more complex application where writing the barebones logic would exceed
the size of an SPA library then I would opt to use such a library.

The drawback of this is that I wouldn't be leveraging a virtual DOM but rather manipulating the DOM directly. An SPA library would
provide this feature and benefit me further in performance. However the simplicity of this project doesn't warrant it.

Additionally, I'm caching the post data that I retrieve in order to avoid additional network requests. The approach is that I load
data from the network request, cache it in IndexedDB then retreive from IndexedDB rather than from the network.

This can also be achieved with a service worker, however I chose to use IndexedDB because the server worker hooks into the fetch request
and adds a bit of overhead to processing the request. With IndexedDB I can bypass the network request altogether.