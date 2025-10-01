type Result<T, E extends { reason: string; stack?: string }> = T | Err<E>;
type Err<E extends { reason: string; stack?: string }> = { ok: false } & E;

export function ok<
  T,
  E extends { reason: string; stack?: string } = {
    reason: string;
    stack?: string;
  }
>(value: T): Result<T, E> {
  return value;
}

/** 构造 Err 并自动附带 stack 信息 */
export function err<E extends { reason: string }>(
  reason: E
): Result<never, E & { stack: string }> {
  return { ok: false, ...reason, stack: new Error().stack! };
}

/** 类型守卫 */
export function isErr<T, E extends { reason: string; stack?: string }>(
  r: Result<T, E>
): r is Err<E> {
  return typeof r === "object" && r !== null && "ok" in r && r.ok === false;
}

export function isOk<T, E extends { reason: string; stack?: string }>(
  r: Result<T, E>
): r is T {
  return !isErr(r);
}

/** safe: 捕获同步异常，返回 Result */
export function safe<
  T,
  E extends { reason: string; stack?: string } = {
    reason: string;
    stack?: string;
  }
>(
  fn: () => T,
  mapError: (e: unknown) => E = (e) => ({ reason: (e as Error).message } as E)
): Result<T, E> {
  try {
    return ok(fn());
  } catch (e) {
    return err(mapError(e));
  }
}

/** safeAsync: 捕获异步异常，返回 Promise<Result> */
export async function safeAsync<
  T,
  E extends { reason: string; stack?: string } = {
    reason: string;
    stack?: string;
  }
>(
  fn: () => Promise<T>,
  mapError: (e: unknown) => E = (e) => ({ reason: (e as Error).message } as E)
): Promise<Result<T, E>> {
  try {
    return ok(await fn());
  } catch (e) {
    return err(mapError(e));
  }
}
