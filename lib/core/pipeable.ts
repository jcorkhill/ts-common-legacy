import { UnaryFunction } from './types/funcs'

/**
 * Represents a data structure that supports pipe operations.
 */
export interface IPipeable<I> {
  /**
   * Pipes Self through the provided functions.
   */
  pipe<O>(o1: UnaryFunction<I, O>): O
  pipe<A, O>(o1: UnaryFunction<I, A>, o2: UnaryFunction<A, O>): O
  pipe<A, B, O>(
    o1: UnaryFunction<I, A>,
    o2: UnaryFunction<A, B>,
    o3: UnaryFunction<B, O>
  ): O
  pipe<A, B, C, O>(
    o1: UnaryFunction<I, A>,
    o2: UnaryFunction<A, B>,
    o3: UnaryFunction<B, C>,
    o4: UnaryFunction<C, O>
  ): O
  pipe<A, B, C, D, O>(
    o1: UnaryFunction<I, A>,
    o2: UnaryFunction<A, B>,
    o3: UnaryFunction<B, C>,
    o4: UnaryFunction<C, D>,
    o5: UnaryFunction<D, O>
  ): O
  pipe<A, B, C, D, E, O>(
    o1: UnaryFunction<I, A>,
    o2: UnaryFunction<A, B>,
    o3: UnaryFunction<B, C>,
    o4: UnaryFunction<C, D>,
    o5: UnaryFunction<D, E>,
    o6: UnaryFunction<E, O>
  ): O
  pipe<A, B, C, D, E, F, O>(
    o1: UnaryFunction<I, A>,
    o2: UnaryFunction<A, B>,
    o3: UnaryFunction<B, C>,
    o4: UnaryFunction<C, D>,
    o5: UnaryFunction<D, E>,
    o6: UnaryFunction<E, F>,
    o7: UnaryFunction<F, O>
  ): O
  pipe<A, B, C, D, E, F, G, O>(
    o1: UnaryFunction<I, A>,
    o2: UnaryFunction<A, B>,
    o3: UnaryFunction<B, C>,
    o4: UnaryFunction<C, D>,
    o5: UnaryFunction<D, E>,
    o6: UnaryFunction<E, F>,
    o7: UnaryFunction<F, G>,
    o8: UnaryFunction<G, O>
  ): O
  pipe<A, B, C, D, E, F, G, H, O>(
    o1: UnaryFunction<I, A>,
    o2: UnaryFunction<A, B>,
    o3: UnaryFunction<B, C>,
    o4: UnaryFunction<C, D>,
    o5: UnaryFunction<D, E>,
    o6: UnaryFunction<E, F>,
    o7: UnaryFunction<F, G>,
    o8: UnaryFunction<G, H>,
    o9: UnaryFunction<H, O>
  ): O
  pipe<A, B, C, D, E, F, G, H, J, O>(
    o1: UnaryFunction<I, A>,
    o2: UnaryFunction<A, B>,
    o3: UnaryFunction<B, C>,
    o4: UnaryFunction<C, D>,
    o5: UnaryFunction<D, E>,
    o6: UnaryFunction<E, F>,
    o7: UnaryFunction<F, G>,
    o8: UnaryFunction<G, H>,
    o9: UnaryFunction<H, J>,
    o10: UnaryFunction<J, O>
  ): O
}

/**
 * Implementation of `pipe` for a pipeable data structure.
 *
 * NOTICE: Not for external use.
 */
export function structurePipe<T>(
  self: IPipeable<T>,
  ...args: UnaryFunction<any, any>[]
) {
  return args.reduce((acc, f) => f(acc), self)
}
