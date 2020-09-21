importScripts(
  "https://cdnjs.cloudflare.com/ajax/libs/localforage/1.7.3/localforage.min.js"
)

let somedomainStore = localforage.createInstance({
  name: "somedomain"
})

let offlinePostCache = (event, store) => {
  const req = event.request.clone()
  let key = {
    url: req.url,
    method: req.method,
    credentials: req.credentials
  }
  let keyId = ""
  return new Promise((res, rej) => {
    req.text().then(body => {
      key.body = body
      keyId = JSON.stringify(key)
      fetch(event.request)
        .then(response => {
          return response.json()
        })
        .then(response => {
          store.setItem(keyId, JSON.stringify(response))
          res(
            new Response(JSON.stringify(response), {
              status: 200
            })
          )
        })
        .catch(error => {
          store.getItem(keyId).then(cachedRes => {
            res(
              new Response(cachedRes, {
                status: 200
              })
            )
          })
        })
    })
  })
}

// By route
workbox.routing.registerRoute(
  new RegExp("https://somedomain.com/api/(.*)"),
  ({
    event
  }) => offlinePostCache(event, somedomainStore),
  "POST"
)
