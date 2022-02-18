import { identity } from './identity'
import { throws } from './throws'
import { UnaryFunction } from './types/funcs'

/**
 * The Result (Either) Monad.
 *
 * Represents a result that is either an error or a failure,
 * and permits performing operations on those values in a
 * type-agnostic manner.
 */
export interface Result<E, T> {
  /**
   * Performs the mapping operation `f` if self is `Ok(T)`.
   *
   * @param f
   * A function that maps inner Ok value `T` to `U` if self is `Ok(T).
   */
  map<U>(f: (t: T) => U): Result<E, U>

  /**
   * Performs the asynchronous mapping operation `f` if self
   * `Ok(T)`.
   *
   * @param f
   * A function that maps inner Ok value `T` to `U` self is `Ok(T)`.
   */
  mapAsync<U>(f: (t: T) => Promise<U>): Promise<Result<E, U>>

  /**
   * Performs the mapping operation `f` is self is `Err(E)`
   *
   * @param f
   * A functions that maps inner Err value `E` to `U` if Self
   * is `Err(E)`.
   */
  mapErr<U>(f: (e: E) => U): Result<U, T>

  /**
   * Performs the asynchronous mapping operation `f` is self is
   * `Err(E)`
   *
   * @param f
   * A functions that maps inner Err value `E` to `U` if Self
   * is `Err(E)`.
   */
  mapErrAsync<U>(f: (e: E) => Promise<U>): Promise<Result<U, T>>

  /**
   * Performs the mapping operation `f` and flattens the result if self
   * is `Ok(T)`.
   *
   * @param f
   * A function that maps inner Ok value `T` to to `Result<E, U>` if self
   * is `Ok(T)`.
   */
  chain<U, B>(f: (t: T) => Result<B, U>): Result<E | B, U>

  /**
   * Performs the asynchronous mapping operation `f` and flattens
   * the result if self is `Ok(T)`.
   *
   * @param f
   * A function that maps inner Ok value `T` to to `Result<E, U>` if self
   * is `Ok(T)`.
   */
  chainAsync<U, B>(
    f: (t: T) => Promise<Result<B, U>>
  ): Promise<Result<E | B, U>>

  /**
   * Executes the variant arm that matches the current Result.
   *
   * This function can be used to leave the current monadic context.
   *
   * @param patterns
   * An object containing `Ok` and `Err` variants.
   */
  match<R>(patterns: IResultMatchPatterns<E, T, R>): R

  /**
   * Unwraps the inner Ok value if self is `Ok(T)`, throws an error if `Err(U)`
   *
   * Prefer `match` or methods that remain within the monadic context over
   * this method.
   */
  unwrap(): T

  /**
   * Unwraps the inner Ok value if self is `Ok(T)`, returns the specified default
   * if `Err(E)`.
   *
   * @param t
   * The default value to return if self is `Err(E)`
   */
  unwrapOr(t: T): T

  /**
   * Unwraps the inner Ok value if self is `Ok(T)`, returns the result from the
   * specified fallback if `Err(E)`.

   * @param f 
   * The default function to execute and from which to return if the Result is 
   * `Err(E)`.
   */
  unwrapOrElse(f: () => T): T

  /**
   * Unwraps the inner Ok value if self is `Ok(T)`, returns the result from the
   * specified asynchronous fallback if `Err(E)`.

   * @param f 
   * The default function to execute and from which to return if the Result is 
   * `Err(E)`.
   */
  unwrapOrElseAsync(f: () => Promise<T>): T | Promise<T>

  /**
   * Unwraps the inner Err value if self is `Err(E)`, throws an error otherwise.
   */
  unwrapErr(): E

  /**
   * Indicates whether the Result is `Ok`.
   */
  isOk(): boolean

  /**
   * Indicates whether the Result is `Err`.
   */
  isErr(): boolean
}

/**
 * Variant arms for pattern matching on a `Result<E, T>`.
 */
export interface IResultMatchPatterns<TError, TValue, TResult> {
  Ok: (t: TValue) => TResult
  Err: (e: TError) => TResult
}

/**
 * Creates a `Result<E, T>` holding the specified value. 
 * 
 * @param isErr 
 * Indicates whether the inner value is of type `Err`.

 * @param value 
 * The `Ok` value, if any.

 * @param error 
 * The `Err` value, if any.

 * @returns 
 * The Result.
 */
export function createResult<E, T>(
  isErr: boolean,
  value?: T,
  error?: E
): Result<E, T> {
  return {
    map<U>(f: (t: T) => U): Result<E, U> {
      return this.match({
        Ok: (t) => ok(f(t)),
        Err: err,
      })
    },

    mapAsync<U>(f: (t: T) => Promise<U>): Promise<Result<E, U>> {
      return this.match({
        Ok: (t) => f(t).then(ok),
        Err: (e) => Promise.resolve(err(e)),
      })
    },

    mapErr<U>(f: (e: E) => U) {
      return this.match<Result<U, T>>({
        Ok: ok,
        Err: (e) => err(f(e)),
      })
    },

    mapErrAsync<U>(f: (e: E) => Promise<U>): Promise<Result<U, T>> {
      return this.match({
        Ok: (t) => Promise.resolve(ok(t)),
        Err: (e) => f(e).then(err),
      })
    },

    chain<U, B>(f: (t: T) => Result<E | B, U>): Result<E | B, U> {
      return this.match({
        Ok: f,
        Err: err,
      })
    },

    chainAsync<U, B>(
      f: (t: T) => Promise<Result<E | B, U>>
    ): Promise<Result<E | B, U>> {
      return this.match({
        Ok: f,
        Err: (e) => Promise.resolve(err(e)),
      })
    },

    match<R>(patterns: IResultMatchPatterns<E, T, R>): R {
      return isErr ? patterns.Err(error!) : patterns.Ok(value!)
    },

    unwrap(): T {
      return this.match({
        Ok: identity,
        Err: throws(() => new Error('Cannot unwrap in error state.')),
      })
    },

    unwrapOr(t: T): T {
      return this.match({
        Ok: identity,
        Err: () => t,
      })
    },

    unwrapOrElse(f: () => T): T {
      return this.match({
        Ok: identity,
        Err: f,
      })
    },

    unwrapOrElseAsync(f: () => Promise<T>): T | Promise<T> {
      return this.match<T | Promise<T>>({
        Ok: identity,
        Err: f,
      })
    },

    unwrapErr(): E {
      return this.match({
        Ok: throws(() => new Error('Cannot unwrap error of Ok')),
        Err: identity,
      })
    },

    isOk() {
      return !isErr
    },

    isErr() {
      return isErr
    },
  }
}

/**
 * Creates a `Result` in the `Ok` state containing `value`.
 */
export function ok<T, E = never>(value?: T): Result<E, T> {
  return createResult(false, value, null as never)
}

/**
 * Creates a `Result` in the `Err` state containing `error`.
 */
export function err<E, T = never>(error: E): Result<E, T> {
  return createResult(true, null as never, error)
}

/**
 * Helper for representing a function of type:
 *
 * ```
 * Result<E, T> -> R
 * ```
 */
export type ResultOperator<E, T, R> = UnaryFunction<Result<E, T>, R>

/**
 * Signatures for higher-order result functions for use in
 * pipeline operations.
 */
interface IResultOperators {
  /**
   * Performs the mapping operation `f` if self is `Ok(T)`.
   *
   * @param f
   * A function that maps inner Ok value `T` to `U` if self is `Ok(T).
   */
  map<E, T, U>(f: (t: T) => U): ResultOperator<E, T, Result<E, U>>

  /**
   * Performs the asynchronous mapping operation `f` if self
   * `Ok(T)`.
   *
   * @param f
   * A function that maps inner Ok value `T` to `U` self is `Ok(T)`.
   */
  mapAsync<E, T, U>(
    f: (t: T) => Promise<U>
  ): ResultOperator<E, T, Promise<Result<E, U>>>

  /**
   * Performs the mapping operation `f` is self is `Err(E)`
   *
   * @param f
   * A functions that maps inner Err value `E` to `U` if Self
   * is `Err(E)`.
   */
  mapErr<E, T, U>(f: (e: E) => U): ResultOperator<E, T, Result<U, T>>

  /**
   * Performs the asynchronous mapping operation `f` is self is
   * `Err(E)`
   *
   * @param f
   * A functions that maps inner Err value `E` to `U` if Self
   * is `Err(E)`.
   */
  mapErrAsync<E, T, U>(
    f: (e: E) => Promise<U>
  ): ResultOperator<E, T, Promise<Result<U, T>>>

  /**
   * Performs the mapping operation `f` and flattens the result if self
   * is `Ok(T)`.
   *
   * @param f
   * A function that maps inner Ok value `T` to to `Result<E, U>` if self
   * is `Ok(T)`.
   */
  chain<E, T, U, B>(
    f: (t: T) => Result<B, U>
  ): ResultOperator<E, T, Result<E | B, U>>

  /**
   * Performs the asynchronous mapping operation `f` and flattens
   * the result if self is `Ok(T)`.
   *
   * @param f
   * A function that maps inner Ok value `T` to to `Result<E, U>` if self
   * is `Ok(T)`.
   */
  chainAsync<E, T, U, B>(
    f: (t: T) => Promise<Result<B, U>>
  ): ResultOperator<E, T, Promise<Result<E | B, U>>>

  /**
   * Executes the variant arm that matches the current Result.
   *
   * This function can be used to leave the current monadic context.
   *
   * @param patterns
   * An object containing `Ok` and `Err` variants.
   */
  match<E, T, R>(
    patterns: IResultMatchPatterns<E, T, R>
  ): ResultOperator<E, T, R>

  /**
   * Unwraps the inner Ok value if self is `Ok(T)`, throws an error if `Err(U)`
   *
   * Prefer `match` or methods that remain within the monadic context over
   * this method.
   */
  unwrap<E, T>(): ResultOperator<E, T, T>

  /**
   * Unwraps the inner Ok value if self is `Ok(T)`, returns the specified default
   * if `Err(E)`.
   *
   * @param t
   * The default value to return if self is `Err(E)`
   */
  unwrapOr<E, T>(t: T): ResultOperator<E, T, T>

  /**
   * Unwraps the inner Ok value if self is `Ok(T)`, returns the result from the
   * specified fallback if `Err(E)`.

   * @param f 
   * The default function to execute and from which to return if the Result is 
   * `Err(E)`.
   */
  unwrapOrElse<E, T>(f: () => T): ResultOperator<E, T, T>

  /**
   * Unwraps the inner Ok value if self is `Ok(T)`, returns the result from the
   * specified asynchronous fallback if `Err(E)`.

   * @param f 
   * The default function to execute and from which to return if the Result is 
   * `Err(E)`.
   */
  unwrapOrElseAsync<E, T>(
    f: () => Promise<T>
  ): ResultOperator<E, T, T | Promise<T>>

  /**
   * Indicates whether the Result is `Ok`.
   */
  isErr<E, T>(): ResultOperator<E, T, boolean>

  /**
   * Indicates whether the Result is `Err`.
   */
  isOk<E, T>(): ResultOperator<E, T, boolean>
}

/**
 * Result Monad operator methods. Useful for pipeline
 * operations.
 */
export const Result: IResultOperators = {
  map: (f) => (r) => r.map(f),
  mapAsync: (f) => (r) => r.mapAsync(f),
  mapErr: (f) => (r) => r.mapErr(f),
  mapErrAsync: (f) => (r) => r.mapErrAsync(f),
  chain: (f) => (r) => r.chain(f),
  chainAsync: (f) => (r) => r.chainAsync(f),
  match: (patterns) => (r) => r.match(patterns),
  unwrap: () => (r) => r.unwrap(),
  unwrapOr: (t) => (r) => r.unwrapOr(t),
  unwrapOrElse: (f) => (r) => r.unwrapOrElse(f),
  unwrapOrElseAsync: (f) => (r) => r.unwrapOrElseAsync(f),
  isErr: () => (r) => r.isErr(),
  isOk: () => (r) => r.isOk(),
}
