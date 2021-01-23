interface MemoizeCacheEntry<Func extends (...args: any[]) => any> {
  readonly args: Parameters<Func>;
  readonly result: ReturnType<Func>;
}

/**
 * Creates a copy of `fn` that caches the last result.
 * If called again with the same parameters, the cached result is returned.
 */
export function memoize<Func extends (...args: any[]) => any>(
  fn: Func,
  cacheSize: number = 1,
): Func {
  const cache: MemoizeCacheEntry<Func>[] = [];

  return function (...args: Parameters<Func>): ReturnType<Func> {
    for (const { args: lastArgs, result: lastResult } of cache) {
      if (lastArgs.every((arg, i) => arg === args[i])) {
        return lastResult;
      }
    }

    const entry: MemoizeCacheEntry<Func> = { args, result: fn(...args) };
    cache.push(entry);
    while (cache.length > cacheSize) {
      cache.unshift();
    }

    return entry.result;
  } as Func;
}
