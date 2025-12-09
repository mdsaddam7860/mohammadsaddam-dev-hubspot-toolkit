import axios from 'axios';
import pRetry from 'p-retry';

// Old Implementation
/*
function createHubspotClient({
  apiKey,
  baseUrl = 'https://api.hubapi.com',
  timeout = 10000,
}) {
  if (!apiKey) throw new Error('apiKey required');

  const client = axios.create({
    baseURL: baseUrl,
    timeout,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  // attach auth and simple retry wrapper
  async function request(cfg) {
    const makeCall = async () => {
      const merged = Object.assign({}, cfg, {
        headers: Object.assign({}, cfg.headers || {}, {
          Authorization: `Bearer ${apiKey}`,
        }),
      });
      const res = await client.request(merged);
      return res.data;
    };

    return pRetry(makeCall, {
      retries: 2,
      onFailedAttempt: (err) => {
        // small logging hook
        // console.warn('attempt', err.attemptNumber, err);
      },
    });
  }

  return {
    get: (url, params = {}) => request({ method: 'GET', url, params }),
    post: (url, data = {}, params = {}) => request({ method: 'POST', url, data, params }),
    patch: (url, data = {}, params = {}) =>
      request({ method: 'PATCH', url, data, params }),
    put: (url, data = {}, params = {}) => request({ method: 'PUT', url, data, params }),
    delete: (url, params = {}) => request({ method: 'DELETE', url, params }),
  };
}
*/

// New Implementation

// function createHubspotClient({
//   apiKey, // legacy key (hapikey)
//   accessToken, // recommended private app token
//   baseUrl = 'https://api.hubapi.com',
//   timeout = 10000,
// }) {
//   if (!apiKey && !accessToken) {
//     throw new Error('Either accessToken or apiKey must be provided');
//   }

//   const client = axios.create({
//     baseURL: baseUrl,
//     timeout,
//     headers: {
//       'Content-Type': 'application/json',
//       Accept: 'application/json',
//     },
//   });

//   // -----------------------------------------------------
//   //  Wrapper to apply auth + retry
//   // -----------------------------------------------------
//   async function request(cfg) {
//     const makeCall = async () => {
//       const merged = { ...cfg, headers: { ...(cfg.headers || {}) } };

//       // -------------------------------
//       //  AUTH HANDLING
//       // -------------------------------
//       if (accessToken) {
//         // Private app token → Authorization header
//         merged.headers.Authorization = `Bearer ${accessToken}`;
//       } else if (apiKey) {
//         // Legacy API key → use hapikey query param
//         merged.params = {
//           ...(merged.params || {}),
//           hapikey: apiKey,
//         };
//       }

//       const res = await client.request(merged);
//       return res; // return full axios response
//     };

//     return pRetry(makeCall, {
//       retries: 3,
//       onFailedAttempt(err) {
//         // console.warn('Retry:', err.attemptNumber, err?.message);
//       },
//     });
//   }

//   // -----------------------------------------------------
//   //  PUBLIC CLIENT API
//   // -----------------------------------------------------
//   return {
//     get: (url, opts = {}) => request({ method: 'GET', url, ...opts }),
//     post: (url, data = {}, opts = {}) => request({ method: 'POST', url, data, ...opts }),
//     patch: (url, data = {}, opts = {}) =>
//       request({ method: 'PATCH', url, data, ...opts }),
//     put: (url, data = {}, opts = {}) => request({ method: 'PUT', url, data, ...opts }),
//     delete: (url, opts = {}) => request({ method: 'DELETE', url, ...opts }),

//     // raw axios instance
//     __axios: client,
//   };
// }

// createHubspotClient (fixed to return res.data)
function createHubspotClient({
  apiKey, // legacy key (hapikey)
  accessToken, // recommended private app token
  baseUrl = 'https://api.hubapi.com',
  timeout = 10000,
}) {
  if (!apiKey && !accessToken) {
    throw new Error('Either accessToken or apiKey must be provided');
  }

  const client = axios.create({
    baseURL: baseUrl,
    timeout,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  // -----------------------------------------------------
  //  Wrapper to apply auth + retry
  // -----------------------------------------------------
  async function request(cfg) {
    const makeCall = async () => {
      const merged = { ...cfg, headers: { ...(cfg.headers || {}) } };

      // -------------------------------
      //  AUTH HANDLING
      // -------------------------------
      if (accessToken) {
        // Private app token → Authorization header
        merged.headers.Authorization = `Bearer ${accessToken}`;
      } else if (apiKey) {
        // Legacy API key → use hapikey query param
        merged.params = {
          ...(merged.params || {}),
          hapikey: apiKey,
        };
      }

      const res = await client.request(merged);
      // return only the data payload (what fetchAllPages expects)
      return res.data;
    };

    return pRetry(makeCall, {
      retries: 3,
      onFailedAttempt(err) {
        // Consider logging err.attemptNumber and err.message for debugging
        // console.warn('Retry:', err.attemptNumber, err?.message);
      },
    });
  }

  // -----------------------------------------------------
  //  PUBLIC CLIENT API
  // -----------------------------------------------------
  return {
    get: (url, opts = {}) => request({ method: 'GET', url, ...opts }),
    post: (url, data = {}, opts = {}) => request({ method: 'POST', url, data, ...opts }),
    patch: (url, data = {}, opts = {}) =>
      request({ method: 'PATCH', url, data, ...opts }),
    put: (url, data = {}, opts = {}) => request({ method: 'PUT', url, data, ...opts }),
    delete: (url, opts = {}) => request({ method: 'DELETE', url, ...opts }),

    // raw axios instance for callers that want the full Axios response
    __axios: client,
  };
}

export { createHubspotClient };
