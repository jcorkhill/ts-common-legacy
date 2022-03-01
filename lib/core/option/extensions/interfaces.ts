import { Option } from './../option'
import { Result } from '../../result/result'
import { UnaryFunction } from '../../types/funcs'
import { ValueAbsent } from './toResult'

/**
 * Helper for representing a function of type:
 *
 * ```
 * Option<TOptionInnerValue> -> TResult
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
interface IOptionOperators {
  /**
   * Performs the mapping operation `f` if the inner value is `Some(T)`.
   *
   * @param f
   * A function that maps inner value `T` to `U` if `T` is `Some(T)`.
   */
  map<T, U>(f: (t: T) => U): OptionOperator<T, Option<U>>

  /**
   * Performs the asynchronous mapping operation `f` if the inner value is
   * `Some(T)`.
   *
   * @param f
   * A function that maps inner value `T` to `U` if `T` is `Some(T)`.
   */
  mapAsync<T, U>(f: (t: T) => Promise<U>): OptionOperator<T, Promise<Option<U>>>

  /**
   * Executes the given predicate function if the current Option is a `Some(T)`,
   * returns `None` otherwise.
   *
   * If the predicate evaluates to `true`, returns the current option. If the
   * predicate evaluates to `false`, returns `None`.
   */
  filter<T>(f: (t: T) => boolean): OptionOperator<T, Option<T>>

  /**
   * Executes the given asynchronous predicate function if the current Option is
   * `Some(T)`, returns `None` otherwise.
   *
   * If the predicate evaluates to `true`, returns the current option. If the
   * predicate evaluates to `false`, returns `None`.
   */
  filterAsync<T>(
    f: (t: T) => Promise<boolean>
  ): OptionOperator<T, Promise<Option<T>>>

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
   * Executes the given function for inner value contained in the Option.
   *
   * Use this to perform effects.
   *
   * @param f
   * The function to apply on the inner value.
   */
  forEach<T>(f: (t: T) => void): OptionOperator<T, void>

  /**
   * Executes the given asynchronous function for the inner value contained
   * in the Option.
   *
   * Use this to perform effects.
   *
   * @param f
   * The function to apply on the inner value.
   */
  forEachAsync<T>(f: (t: T) => Promise<void>): OptionOperator<T, Promise<void>>

  /**
   * Executes the given function for the inner value contained in the Option
   * if the inner value is `Some(T)`.
   *
   * @param f
   * The function to apply on the inner value.
   */
  tap<T>(f: (t: T) => void): OptionOperator<T, Option<T>>

  /**
   * Executes the given asynchronous function for the inner value contained in the Option
   * if the inner value is `Some(T)`.
   *
   * @param f
   * The function to apply on the inner value.
   */
  tapAsync<T>(f: (t: T) => Promise<void>): OptionOperator<T, Promise<Option<T>>>

  /**
   * Unwraps the inner value if `Some(T)`, throws an error if `None`.
   *
   * Prefer `match` or methods that remain within the `monadic` context over
   * this method.
   */
  unwrap<T>(): OptionOperator<T, T>

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
  unwrapOr<T>(t: T): OptionOperator<T, T>

  /**
   * Unwraps the inner value if `Some(T)`, returns the result of the specified
   * fallback function if `None`.
   *
   * @param f
   * The default function to execute and from which to return if the Option
   * is `None`.
   */
  unwrapOrElse<T>(f: () => T): OptionOperator<T, T>

  /**
   * Unwraps the inner value if `Some(T)`, returns the result of the specified
   * asynchronous fallback function if `None`.
   *
   * @param f
   * The default function to execute and from which to return if the Option
   * is `None`.
   */
  unwrapOrElseAsync<T>(f: () => Promise<T>): OptionOperator<T, T | Promise<T>>

  /**
   * Indicates whether the Option is `None(T)`.
   */
  isNone<T>(): OptionOperator<T, boolean>

  /**
   * Indicates whether the Option is `Some(T)`.
   */
  isSome<T>(): OptionOperator<T, boolean>
}

interface IOptionOperatorExtensions {
  /**
   * Converts the `Option<T>` to a `Result<ValueAbsent, T>`.
   */
  toResult<T>(): OptionOperator<T, Result<ValueAbsent, T>>
}

/**
 * Option Monad Extensions, including higher-order operators.
 */
export interface IOptionExtensions
  extends IOptionOperators,
    IOptionOperatorExtensions {
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
  of<T>(t: T): Option<NonNullable<T>>
}
