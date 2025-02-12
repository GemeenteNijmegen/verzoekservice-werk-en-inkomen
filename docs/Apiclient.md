# Apiclient

To make the graphql connection, the client needs:
* Works well with graphql
* mTLS connection ability (sending certificates)
* Use in Common-JS tsconfig setup (not modules only)
* Good for backend services, not used in the frontend

### Choices
* Apollo client
* Axios
* Node native fetch
* Graphql request

**Apollo**
Apollo's advantage is the caching features. Mostly useful for frontend GQL calls and very complex GQL calls.
- No out-of-the-box mTLS support
- Will need undici or node-fetch@2 to send the certificates because of our CommonJS module
- Relatively large library - more than 100kb

- Best suited for frontend applications, state management, and GraphQL subscriptions
- Supports query batching, error handling, and retries
- Popular library +5 million users, great docs and no known vunerabilities.

**Axios**
Axios's great advantage is out of the box mTLS cert sending
- Works natively with mTLS (https.Agent support)
- Supports retries, error handling, and request cancellation
- Works in CommonJS without issues
- No GraphQL-specific support (just a REST client that can send GraphQL queries)
- No built-in caching

**Native fetch**
The built-in fetch in Node.js 18+ can send GraphQL requests, but does not support mTLS directly.

- No out-of-the-box mTLS support
- Lightweight (built into Node.js, no dependencies)
- Works in CommonJS if used with undici or node-fetch@2
- No built-in GraphQL support (just a standard HTTP client)
- No caching, no query batching, no GraphQL optimizations
  
**Graphql request**
A lightweight GraphQL client that is ideal for backend services without caching needs.

- Works well with GraphQL queries & mutations
- Lightweight (~5KB), no extra dependencies
- Works in CommonJS without issues
- No built-in mTLS support (needs https.Agent like Axios)
- No caching, no query batching, no subscriptions

Popular librarym actively maintained and no major vulnerabilites

#### Node-fetch@2 and undici
Since Node native fetch does NOT support mTLS, we need either:
- undici (used internally in Node.js 18+, supports https.Agent) Projen undici requires node >=20.18.1.
- undici is also used in Node under the hood. So secure and actively maintained by node.js
- undici's latest version by projen gives issues, is incompatible with the Node version we are using in some places.
- node-fetch@2 (works with CommonJS, supports https.Agent for mTLS)
- node-fetch@2 is no longer maintained. Deprecated in favor of native fetch (which misses the cert options)
- node-fetch@2 has no security anymore

node-fetch 3 is ESM only. WHich can work, but is not ideal with our CommonJS settings.

We could choose to add node versions and an nvmrc (to which you can add scripts to use the correct node version locally)
Especially useful for the undici issue
projenrc
```
  packageOptions: {
    engines: {
      node: '20.18.1', // or 
    },
  },

  // Or/and create an `.nvmrc` file for developers
  files: ['.nvmrc'], // not a projenrc native function
```

#### Ranking for needs
| Use Case | Best Library |
|----------|-------------|
| Backend service needing mTLS support | Axios |
| Lightweight backend GraphQL client | GraphQL Request |
| Frontend GraphQL client (Framworks frontend) | Apollo Client |
| Server-side GraphQL with caching & batching | Apollo Client |
| Simple fetch-based GraphQL calls (no mTLS) | Native Fetch |
| CommonJS + mTLS GraphQL calls | Axios or GraphQL Request with `https.Agent` |