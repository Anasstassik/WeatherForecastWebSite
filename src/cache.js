export const createCacheDecorator = (duration = 3 * 60 * 60 * 1000) => {
    const cache = new Map();

    const clearExpired = (now) => {
        for (const [key, value] of cache.entries()) {
            if (now - value.timestamp > duration) {
                console.log('del cache')
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

    return (asyncFn) => {
        return async (...args) => {
            const now = Date.now();
            clearExpired(now);

            const key = generateKey(args);
            if (!key) return await asyncFn(...args);

            if (cache.has(key)) {
                const cached = cache.get(key);
                if (now - cached.timestamp < duration) {
                    console.log('cache hit');
                    return cached.data;
                }
            }

            console.log('cache miss');
            try {
                const data = await asyncFn(...args);
                cache.set(key, { data, timestamp: now });
                return data;
            } catch (err) {
                console.error('Error in cached function:', err);
                return null;
            }
        };
    };
};