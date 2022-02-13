import { identity } from './identity'
import { noop } from './noop'
import { throws } from './throws'
import { UnaryFunction } from './types/funcs'
import { Nullable } from './types/nullable'

/**
 * The Option Monad.
 *
 * Encases a possibly optional value and permits performing
 * operations on it in a consistent and type-agnostic manner.
 */
export interface Option<T> {
  /**
   * Performs the mapping operation `f` if the inner value is `Some(T)`.
   *
   * @param f
   * A function that maps inner value `T` to `U` if `T` is `Some(T)`.
   */
  map<U>(f: (t: T) => U): Option<U>

  /**
   * Performs the asynchronous mapping operation `f` if the inner value is
   * `Some(T)`.
   *
   * @param f
   * A function that maps inner value `T` to `U` if `T` is `Some(T)`.
   */
  mapAsync<U>(f: (t: T) => Promise<U>): Promise<Option<U>>

  /**
   * Performs the mapping operation `f` and flattens the result if the
   * inner value is `Some(T)`.
   *
   * @param f
   * A function that maps inner value `T` to `Option<U>` if `T` is
   * `Some`.
   */
  chain<U>(f: (t: T) => Option<U>): Option<U>

  /**
   * Performs the asynchronous mapping operation `f` and flattens the result
   * if the inner value is `Some(T)`.
   *
   * @param f
   * A function that maps inner value `T` to `Option<U>` if `T` is
   * `Some(T)`.
   */
  chainAsync<U>(f: (t: T) => Promise<Option<U>>): Promise<Option<U>>

  /**
   * Executes the given predicate function if the current Option is a `Some(T)`,
   * returns `None` otherwise.
   *
   * If the predicate evaluates to `true`, returns the current option. If the
   * predicate evaluates to `false`, returns `None`.
   */
  filter(f: (t: T) => boolean): Option<T>

  /**
   * Executes the given asynchronous predicate function if the current Option is
   * `Some(T)`, returns `None` otherwise.
   *
   * If the predicate evaluates to `true`, returns the current option. If the
   * predicate evaluates to `false`, returns `None`.
   */
  filterAsync(f: (t: T) => Promise<boolean>): Promise<Option<T>>

  /**
   * Executes the variant arm that matches the current Option.
   *
   * This function can be used to leave the current monadic context.
   *
   * @param patterns
   * An object containing `None` and `Some` variants.
   */
  match<R>(patterns: IOptionMatchPatterns<T, R>): R

  /**
   * Executes the given function for inner value contained in the Option.
   *
   * Use this to perform effects.
   *
   * @param f
   * The function to apply on the inner value.
   */
  forEach(f: (t: T) => void): void

  /**
   * Executes the given asynchronous function for the inner value contained
   * in the Option.
   *
   * Use this to perform effects.
   *
   * @param f
   * The function to apply on the inner value.
   */
  forEachAsync(f: (t: T) => Promise<void>): void

  /**
   * Unwraps the inner value if `Some(T)`, throws an error if `None`.
   *
   * Prefer `match` or methods that remain within the `monadic` context over
   * this method.
   */
  unwrap(): T

  /**
   * Unwraps the inner value if `Some(T)`, returns the specified default if
   * `None`.
   *
   * Prefer `match` or methods that remain within the `monadic` context over
   * this method.
   *
   * @param t
   * The default value to return if the Option is `None`.
   */
  unwrapOr(t: T): T

  /**
   * Unwraps the inner value if `Some(T)`, returns the result of the specified
   * fallback function if `None`.
   *
   * @param f
   * The default function to execute and from which to return if the Option
   * is `None`.
   */
  unwrapOrElse(f: () => T): T

  /**
   * Unwraps the inner value if `Some(T)`, returns the result of the specified
   * asynchronous fallback function if `None`.
   *
   * @param f
   * The default function to execute and from which to return if the Option
   * is `None`.
   */
  unwrapOrElseAsync(f: () => Promise<T>): T | Promise<T>

  /**
   * Indicates whether the Option is a `None`.
   */
  isNone(): boolean

  /**
   * Indicates whether the Option is a `Some`.
   */
  isSome(): boolean
}

/**
 * Variant arms for pattern matching on an `Option<T>`.
 */
export interface IOptionMatchPatterns<TValue, TResult> {
  /**
   * Executed if the `Option` is `None(T)`.
   */
  None: () => TResult

  /**
   * Executed if the `Option` i `Some(T)`.
   */
  Some: (t: TValue) => TResult
}

/**
 * Creates an `Option<T>` holding the specified value. A `null` `value`
 * creates an Option in the `none` state, but the `some<T>()` and `none()`
 * return functions should be preferred for option creation.
 *
 * @param value
 * The value to lift into the option.
 *
 * @returns
 * The option.
 */
export function createOption<T>(value: Nullable<T>): Option<T> {
  const isSome = value !== null

  return {
    map<U>(f: (t: T) => U): Option<U> {
      return this.match({
        Some: (t) => some(f(t)),
        None: none,
      })
    },

    mapAsync<U>(f: (t: T) => Promise<U>): Promise<Option<U>> {
      return this.match({
        Some: (t) => f(t).then(some),
        None: () => Promise.resolve(none()),
      })
    },

    chain<U>(f: (t: T) => Option<U>): Option<U> {
      return this.match({
        Some: f,
        None: none,
      })
    },

    chainAsync<U>(f: (t: T) => Promise<Option<U>>): Promise<Option<U>> {
      return this.match({
        Some: f,
        None: () => Promise.resolve(none()),
      })
    },

    filter(f: (t: T) => boolean): Option<T> {
      return this.match({
        Some: (t) => (f(t) ? this : none()),
        None: none,
      })
    },

    filterAsync(f: (t: T) => Promise<boolean>): Promise<Option<T>> {
      return this.match({
        Some: (t) => f(t).then((r) => (r ? this : none())),
        None: () => Promise.resolve(none()),
      })
    },

    match<R>(patterns: IOptionMatchPatterns<T, R>): R {
      return isSome ? patterns.Some(value) : patterns.None()
    },

    forEach(f: (t: T) => void): void {
      return this.match({
        Some: f,
        None: noop,
      })
    },

    forEachAsync(f: (t: T) => Promise<void>): Promise<void> {
      return this.match({
        Some: f,
        None: () => Promise.resolve(),
      })
    },

    unwrap(): T {
      return this.match({
        Some: identity,
        None: throws(() => new Error('Cannot unwrap an Option of "None"')),
      })
    },

    unwrapOr(u: T): T {
      return this.match({
        Some: identity,
        None: () => u,
      })
    },

    unwrapOrElse(f: () => T): T {
      return this.match({
        Some: identity,
        None: f,
      })
    },

    unwrapOrElseAsync(f: () => Promise<T>): T | Promise<T> {
      return this.match<T | Promise<T>>({
        Some: identity,
        None: f,
      })
    },

    isNone() {
      return !isSome
    },

    isSome() {
      return isSome
    },
  }
}

/**
 * Creates an `Option` in the "some" state containing `value`.
 *
 * This is one of the two "Return" operations for `Option<T>`.
 *
 * @returns
 */
export function some<T>(value: T): Option<T> {
  return createOption(value)
}

/**
 * Creates an `Option` in the "none" state.
 *
 * This is one of the two "Return" operations for `Option<T>`.
 * @returns
 */
export function none(): Option<never> {
  return createOption(null as never)
}

/**
 * Helper for representing a function of type:
 *
 * ```
 * (o: Option<TOptionInnerValue>) => TResult
 * ```
 */
export type OptionOperator<TOptionInnerValue, TResult> = UnaryFunction<
  Option<TOptionInnerValue>,
  TResult
>

/**
 * Signatures for higher-order option functions for use in
 * pipeline operations.
 */
interface IOptionHigherOrderFunctions {
  /**
   * Performs the mapping operation `f` and flattens the result if the
   * inner value is `Some(T)`.
   *
   * @param f
   * A function that maps inner value `T` to `Option<U>` if `T` is
   * `Some`.
   */
  chain<T, U>(f: (t: T) => Option<U>): OptionOperator<T, Option<U>>

  /**
   * Performs the asynchronous mapping operation `f` and flattens the result
   * if the inner value is `Some(T)`.
   *
   * @param f
   * A function that maps inner value `T` to `Option<U>` if `T` is
   * `Some(T)`.
   */
  chainAsync<T, U>(
    f: (t: T) => Promise<Option<U>>
  ): OptionOperator<T, Promise<Option<U>>>

  /**
   * Unwraps the inner value if `Some(T)`, throws an error if `None`.
   *
   * Prefer `match` or methods that remain within the `monadic` context over
   * this method.
   */
  unwrap<T>(): OptionOperator<T, T>

  /**
   * Indicates whether the Option is `None(T)`.
   */
  isNone<T>(): OptionOperator<T, boolean>

  /**
   * Indicates whether the Option is `Some(T)`.
   */
  isSome<T>(): OptionOperator<T, boolean>
}

/**
 * Higher order Option Monad methods. Useful for pipeline
 * operations.
 */
export const Option: IOptionHigherOrderFunctions = {
  chain<T, U>(f: (t: T) => Option<U>) {
    return (o: Option<T>) => o.chain(f)
  },

  chainAsync<T, U>(f: (t: T) => Promise<Option<U>>) {
    return (o: Option<T>) =>
      o.match({
        Some: f,
        None: () => Promise.resolve(none()),
      })
  },

  unwrap<T>() {
    return (o: Option<T>) => o.unwrap()
  },

  isNone<T>() {
    return (o: Option<T>) => o.isNone()
  },

  isSome<T>() {
    return (o: Option<T>) => o.isSome()
  },
}

/**
 * Lifts the given value into an `Option<T>` based on the following criteria.
 * 
 * If the value is `null` - `None`.
 * if the value is `undefined` - `None`.
 * If the value is an empty string - `None`.
 * Otherwise - `Some`.
 * 
 * @param value 
 * The value to lift into an Option.

 * @returns 
 * An `Option<T>`.
 */
export function toOption<T>(value: T | null | undefined): Option<T> {
  if (value === null || value === undefined) {
    return none()
  }

  if (typeof value === 'string' && value.length === 0) {
    return none()
  }

  return some(value)
}
