import axios from "axios";
import type { InternalAxiosRequestConfig, AxiosInstance } from "axios";
import { retryRequestWithExponentialBackoff } from "../utils/retry.util.js";



// 1. Define the shape of your configuration
interface HubspotConfig {
    apiKey?: string;
    accessToken: string;
    baseUrl?: string;
    timeout?: number;
    maxRetries?: number;
    baseDelay?: number;
}

// 2. Apply the interface to the destructured object
// 1. Define the interface for your custom return object
interface HubSpotClient {
    get: <T = any>(url: string, opts?: any) => Promise<T>;
    post: <T = any>(url: string, data?: any, opts?: any) => Promise<T>;
    patch: <T = any>(url: string, data?: any, opts?: any) => Promise<T>;
    put: <T = any>(url: string, data?: any, opts?: any) => Promise<T>;
    delete: <T = any>(url: string, data?: any, opts?: any) => Promise<T>;
    // ... add others
    __axios: AxiosInstance;
}

export function createHubspotClient({
    apiKey,
    accessToken,
    baseUrl = 'https://api.hubapi.com',
    timeout = 10000,
    maxRetries = 3,
    baseDelay = 300,
}: HubspotConfig): HubSpotClient { // Use the custom interface here

    const client = axios.create({
        baseURL: baseUrl,
        timeout: timeout,
    });

    // Handle Auth via Interceptor
    client.interceptors.request.use((config) => {
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        } else if (apiKey) {
            config.params = { ...config.params, hapikey: apiKey };
        }
        return config;
    });

    // This helper wraps the axios call with your retry utility
    const wrappedRequest = async (config: any) => {
        return retryRequestWithExponentialBackoff({
            fn: async () => {
                const response = await client.request(config);
                return response.data; // Return only the data
            },
            maxRetries,
            baseDelay
        });
    };

    // Return the custom API object
    return {
        get: (url, opts = {}) => wrappedRequest({ method: 'GET', url, ...opts }),
        post: (url, data = {}, opts = {}) => wrappedRequest({ method: 'POST', url, data, ...opts }),
        patch: (url, data = {}, opts = {}) => wrappedRequest({ method: 'PATCH', url, data, ...opts }),
        put: (url, data = {}, opts = {}) => wrappedRequest({ method: 'PUT', url, data, ...opts }),
        delete: (url, opts = {}) => wrappedRequest({ method: 'DELETE', url, ...opts }),
        __axios: client,
    };
}