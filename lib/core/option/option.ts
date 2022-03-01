import { IOptionExtensions } from '.'
import { identity } from '../identity'
import { noop } from '../noop'
import { IPipeable, structurePipe } from '../pipeable'
import { throws } from '../throws'
import { UnaryFunction } from '../types/funcs'
import { Nullable } from '../types/nullable'
import { of } from './extensions/of'
import { toResult } from './extensions/toResult'

/**
 * The Option Monad.
 *
 * Encases a possibly optional value and permits performing
 * operations on it in a consistent and type-agnostic manner.
 */
export interface Option<T> extends IPipeable<Option<T>> {
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
   * Executes the given function for inner value contained in the Option
   * if the inner value is `Some(T)`.
   *
   * Use this to perform effects.
   *
   * @param f
   * The function to apply on the inner value.
   */
  forEach(f: (t: T) => void): void

  /**
   * Executes the given asynchronous function for the inner value contained
   * in the Option if the inner value is `Some(T)`.
   *
   * Use this to perform effects.
   *
   * @param f
   * The function to apply on the inner value.
   */
  forEachAsync(f: (t: T) => Promise<void>): Promise<void>

  /**
   * Executes the given function for the inner value contained in the Option
   * if the inner value is `Some(T)`.
   *
   * Use this to perform effects.
   *
   * @param f
   * The function to apply on the inner value.
   */
  tap(f: (t: T) => void): Option<T>

  /**
   * Executes the given asynchronous function for the inner value contained in the Option
   * if the inner value is `Some(T)`.
   *
   * Use this to perform effects.
   *
   * @param f
   * The function to apply on the inner value.
   */
  tapAsync(f: (t: T) => Promise<void>): Promise<Option<T>>

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

    tap(f: (t: T) => void): Option<T> {
      this.forEach(f)
      return this
    },

    tapAsync(f: (t: T) => Promise<void>): Promise<Option<T>> {
      return this.forEachAsync(f).then(() => this)
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

    pipe(...args: UnaryFunction<any, any>[]) {
      return structurePipe(this, ...args)
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
 * Option Monad operator and methods. Useful for pipeline operations.
 */
export const Option: IOptionExtensions = {
  // Primary Operators
  map: (f) => (o) => o.map(f),
  mapAsync: (f) => (o) => o.mapAsync(f),
  chain: (f) => (o) => o.chain(f),
  chainAsync: (f) => (o) => o.chainAsync(f),
  filter: (f) => (o) => o.filter(f),
  filterAsync: (f) => (o) => o.filterAsync(f),
  forEach: (f) => (o) => o.forEach(f),
  forEachAsync: (f) => (o) => o.forEachAsync(f),
  tap: (f) => (o) => o.tap(f),
  tapAsync: (f) => (o) => o.tapAsync(f),
  unwrap: () => (o) => o.unwrap(),
  unwrapOr: (t) => (o) => o.unwrapOr(t),
  unwrapOrElse: (f) => (o) => o.unwrapOrElse(f),
  unwrapOrElseAsync: (f) => (o) => o.unwrapOrElseAsync(f),
  isNone: () => (o) => o.isNone(),
  isSome: () => (o) => o.isSome(),

  // Operator Extensions
  toResult,

  // Extensions
  of,
}
