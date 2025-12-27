import axios from 'axios';
import { retryRequest } from '../utils/retry.js';

function createHubspotClient({
  apiKey,
  accessToken,
  baseUrl = 'https://api.hubapi.com',
  timeout = 10000,
  maxRetries = 3,
  baseDelay = 300, // ms
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
  //  Auth + Retry Wrapper
  // -----------------------------------------------------
  async function request(cfg) {
    const makeCall = async function () {
      const merged = {
        ...cfg,
        headers: { ...(cfg.headers || {}) },
      };

      if (accessToken) {
        merged.headers.Authorization = `Bearer ${accessToken}`;
      } else if (apiKey) {
        merged.params = {
          ...(merged.params || {}),
          hapikey: apiKey,
        };
      }

      const res = await client.request(merged);
      return res.data;
    };

    return retryRequest(makeCall);
  }

  // -----------------------------------------------------
  //  Public Client API
  // -----------------------------------------------------
  return {
    get: (url, opts = {}) => request({ method: 'GET', url, ...opts }),
    post: (url, data = {}, opts = {}) => request({ method: 'POST', url, data, ...opts }),
    patch: (url, data = {}, opts = {}) =>
      request({ method: 'PATCH', url, data, ...opts }),
    put: (url, data = {}, opts = {}) => request({ method: 'PUT', url, data, ...opts }),
    delete: (url, opts = {}) => request({ method: 'DELETE', url, ...opts }),

    __axios: client,
  };
}

export { createHubspotClient };
