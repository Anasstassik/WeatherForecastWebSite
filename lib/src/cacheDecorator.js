export const createCacheDecorator = (duration = 3 * 60 * 60 * 1000) => {
    const cache = new Map();

    const clearExpired = (now) => {
        for (const [key, value] of cache.entries()) {
            if (now - value.timestamp > duration) {
                console.log('del cache for key:', key); 
                cache.delete(key);
            }
        }
    };

    const generateKey = (args) => {
        try {
            return JSON.stringify(args);
        } catch { 
            console.warn('Failed to serialize arguments for cache key.');
            return null;
        }
    };

    const decorator = (asyncFn) => {
        const cachedAsyncFunction = async (...args) => {
            const now = Date.now();
            clearExpired(now);

            const key = generateKey(args);
            if (!key) {
                console.warn('Cache key generation failed, calling original function.');
                return await asyncFn(...args);
            }

            if (cache.has(key)) {
                const cached = cache.get(key);
                if (now - cached.timestamp < duration) {
                    console.log('cache hit for key:', key);
                    return cached.data;
                }
            }

            console.log('cache miss for key:', key);
            try {
                const data = await asyncFn(...args);
                cache.set(key, { data, timestamp: now });
                return data;
            } catch (err) {
                console.error('Error in cached function for key:', key, err);
                return null;
            }
        };

        return cachedAsyncFunction; 
    };

    return decorator; 
};