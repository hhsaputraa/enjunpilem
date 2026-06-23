/**
 * Executes an array of promises or async tasks with a specified concurrency limit.
 * Returns PromiseSettledResult array preserving the original items order.
 */
export async function promisePool<T, R>(
  items: T[],
  task: (item: T) => Promise<R>,
  concurrency: number = 5
): Promise<PromiseSettledResult<R>[]> {
  const results: PromiseSettledResult<R>[] = new Array(items.length);
  const executing = new Set<Promise<void>>();

  const tasksWithIndex = items.map((item, index) => ({ item, index }));

  for (const { item, index } of tasksWithIndex) {
    const p = Promise.resolve()
      .then(() => task(item))
      .then((value) => {
        results[index] = { status: 'fulfilled', value };
      })
      .catch((reason) => {
        results[index] = { status: 'rejected', reason };
      });

    executing.add(p);
    const clean = () => executing.delete(p);
    p.then(clean, clean);

    if (executing.size >= concurrency) {
      await Promise.race(executing);
    }
  }

  await Promise.all(executing);
  return results;
}
