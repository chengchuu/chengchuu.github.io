const retryableStatuses = new Set([408, 425, 429, 500, 502, 503, 504]);

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export async function fetchText(
  url: string,
  init: RequestInit = {},
  attempts = 3,
): Promise<string> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    let response: Response;

    try {
      response = await fetch(url, {
        ...init,
        signal: AbortSignal.timeout(8_000),
      });
    } catch (error) {
      lastError = error;
      if (attempt === attempts) {
        break;
      }

      await wait(250 * 2 ** (attempt - 1));
      continue;
    }

    if (response.ok) {
      return await response.text();
    }

    const error = new Error(`${response.status} ${response.statusText}: ${url}`);
    if (!retryableStatuses.has(response.status) || attempt === attempts) {
      throw error;
    }
    lastError = error;

    await wait(250 * 2 ** (attempt - 1));
  }

  throw lastError instanceof Error
    ? lastError
    : new Error(`Unable to fetch ${url}`);
}

export async function fetchJson<T>(
  url: string,
  init: RequestInit = {},
  attempts = 3,
): Promise<T> {
  return JSON.parse(await fetchText(url, init, attempts)) as T;
}

export async function settleInBatches<T>(
  tasks: readonly (() => Promise<T>)[],
  batchSize: number,
): Promise<PromiseSettledResult<T>[]> {
  if (!Number.isInteger(batchSize) || batchSize < 1) {
    throw new RangeError("batchSize must be a positive integer.");
  }

  const results: PromiseSettledResult<T>[] = [];

  for (let index = 0; index < tasks.length; index += batchSize) {
    const batch = tasks.slice(index, index + batchSize).map((task) => task());
    results.push(...(await Promise.allSettled(batch)));
  }

  return results;
}
