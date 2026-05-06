


// Function for retry request and also rate limiting logic 

type RetryConfig<T> = {
    fn: () => Promise<T>;
    maxRetries?: number;
    baseDelay?: number;
    maxDelay?: number;
};

// Helper for the wait
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
// interface retryConfig {
//     fn: Function;
//     maxRetries: number;
//     baseDelay: number;
//     maxDelay: number;
//     rateLimit: number;
// }

async function retryRequestWithExponentialBackoff<T>({
    fn,
    maxRetries = 3,
    baseDelay = 300,
    maxDelay = 10000,
}: RetryConfig<T>): Promise<T> {
    let attempt = 0;

    while (true) {
        try {
            return await fn();
        } catch (error: any) {
            attempt++;

            // If we've exhausted retries or it's not a retryable error (e.g., 401 Unauthorized)
            // You might want to check error.response?.status here
            if (attempt > maxRetries) {
                throw error;
            }

            // Calculate Exponential Backoff: 300, 600, 1200, etc.
            const backoff = Math.min(baseDelay * 2 ** (attempt - 1), maxDelay);

            // Add "Jitter" (randomness) to avoid synchronized retries
            // This adds/subtracts up to 20% of the wait time randomly
            const jitter = backoff * 0.2 * Math.random();
            const waitTime = backoff + jitter;

            console.warn(`Attempt ${attempt} failed. Retrying in ${Math.round(waitTime)}ms...`);

            await sleep(waitTime);
        }
    }
}


export { retryRequestWithExponentialBackoff }