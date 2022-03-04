import { IResultMatchPatterns, Result } from '..'
import { Option } from '../../option'
import { UnaryFunction } from '../../types/funcs'

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

export interface IResultOperatorExtensions {
  /**
   *  Converts the `Result<E, T>` into an `Option<T>` if Self is `Ok(T)`.
   */
  toOption<E, T>(): ResultOperator<E, T, Option<T>>
}

export interface IResultExtensions
  extends IResultOperators,
    IResultOperatorExtensions {}
