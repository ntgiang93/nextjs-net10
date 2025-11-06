using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Caching.Memory;
using Serilog;
using Newtonsoft.Json;

public class CacheManager
{
    public readonly IMemoryCache _cache;
    private readonly List<string> cacheKeys = new();

    public CacheManager(IMemoryCache cache)
    {
        _cache = cache;
    }

    /// <summary>
    ///     Retrieves data from the cache by key. If it does not exist, uses the factory to create the data, stores it in the
    ///     cache, and returns it.
    /// </summary>
    /// <typeparam name="T">The type of data</typeparam>
    /// <param name="key">The cache key</param>
    /// <param name="factory">The function to create data if it does not exist in the cache</param>
    /// <param name="options">Cache options (if not provided, defaults to 5 minutes sliding expiration)</param>
    /// <returns>The cached data</returns>
    public async Task<T> GetOrCreateAsync<T>(string key, Func<Task<T>> factory, MemoryCacheEntryOptions options = null)
    {
        if (_cache.TryGetValue(key, out T cacheValue)) return cacheValue;
        var result = await factory();

        if (options == null)
            options = new MemoryCacheEntryOptions()
                .SetSlidingExpiration(TimeSpan.FromMinutes(15));
        cacheKeys.Add(key);
        _cache.Set(key, result, options);
        return result;
    }

    public async Task SetCacheAsync<T>(string key, T value, MemoryCacheEntryOptions options = null)
    {
        try
        {
            if (options == null)
                options = new MemoryCacheEntryOptions()
                    .SetSlidingExpiration(TimeSpan.FromMinutes(15));
            cacheKeys.Add(key);
            _cache.Set(key, value, options);
        }
        catch (Exception e)
        {
            Log.Error(e, "Error setting cache: {Key}", key);
        }
    }

    public async Task<T> GetCacheAsync<T>(string key)
    {
        if (_cache.TryGetValue(key, out T cacheValue)) return cacheValue;
        return default;
    }

    /// <summary>
    ///     Removes the cache by the specified key.
    /// </summary>
    /// <param name="key">The cache key to remove</param>
    public void RemoveCache(string key)
    {
        try
        {
            _cache.Remove(key);
            cacheKeys.Remove(key);
        }
        catch (Exception e)
        {
            Log.Error(e, "Error removing cache: {Key}", key);
        }
    }

    /// <summary>
    ///     Removes cache by the specified prefix.
    /// </summary>
    /// <param name="prefix">Prefix of the cache keys to remove</param>
    public void RemoveCacheByPrefix(string prefix)
    {
        try
        {
            var cacheEntries = cacheKeys.Where(k => k.StartsWith(prefix));

            foreach (var key in cacheEntries)
            {
                _cache.Remove(key);
            }
            cacheKeys.RemoveAll(k => k.StartsWith(prefix));
        }
        catch (Exception e)
        {
            Log.Error(e, "Error removing cache by prefix: {Prefix}", prefix);
        }
    }

    /// <summary>
    ///     Generates a cache key from a prefix and parameters, minimizing length and size.
    /// </summary>
    /// <param name="prefix">The cache key prefix</param>
    /// <param name="parameters">The parameters to include in the key</param>
    /// <returns>A compact cache key string</returns>
    public static string GenerateCacheKey(string prefix, params object[] parameters)
    {
        if (parameters == null || parameters.Length == 0)
            return prefix;

        var paramString = JsonConvert.SerializeObject(parameters);
        using (var sha = SHA256.Create())
        {
            var hashBytes = sha.ComputeHash(Encoding.UTF8.GetBytes(paramString));
            var hash = BitConverter.ToString(hashBytes);
            return $"{prefix}:{hash}";
        }
    }
}