import { Option, toOption } from './option'
import { err, ok, Result } from './result'

/**
 * Failure type for when a key cannot be found.
 */
export type KeyNotFound = {
  type: 'KeyNotFound'
}

/**
 * Factory function for a `KeyNotFound` failure type.
 */
export function KeyNotFound(): KeyNotFound {
  return {
    type: 'KeyNotFound',
  }
}

/**
 * Represents a map with a type-safe interface.
 */
export interface ITypedMap<TKey, TValue> {
  /**
   * Clears the map.
   */
  clear(): void

  /**
   * Attempts to delete the specified key and value.
   */
  delete(key: TKey): Result<KeyNotFound, void>

  /**
   * Iterates through all keys and values of the map.
   */
  forEach(
    f: (value: TValue, key: TKey, map: ITypedMap<TKey, TValue>) => void
  ): void

  /**
   * Attempts to retrieve the value at the given key.
   */
  get(key: TKey): Option<TValue>

  /**
   * Indicates whether the given key is registered.
   */
  has(key: TKey): boolean

  /**
   * Sets the value for the given key, creating the key if it doesn't exist,
   * and overwriting the value if it does.
   */
  set(key: TKey, value: TValue): this

  /**
   * Indicates the size (number of items) of the map.
   */
  readonly size: number
}

/**
 * A typed map - wraps the normal JS map but uses `Option` and `Result` in relevant places
 * throughout the interface.
 *
 * NOTICE: Since this function receives a reference to a map, any changes to the original map
 * will appear here. Use `createTypedMap` or `TypedMap.from` to avoid sharing this reference.
 */
function typedMap<TKey, TValue>(
  map: Map<TKey, TValue>
): ITypedMap<TKey, TValue> {
  return {
    clear() {
      map.clear()
    },

    delete(key) {
      return map.delete(key) ? ok() : err(KeyNotFound())
    },

    forEach(f) {
      map.forEach((k, v, m) => f(k, v, TypedMap.from(m, false)))
    },

    get(key) {
      return toOption(map.get(key))
    },

    has(key) {
      return map.has(key)
    },

    set(key, value) {
      map.set(key, value)
      return this
    },

    get size() {
      return map.size
    },
  }
}

/**
 * Creates a Typed Map - wraps a normal JavaScript Map, but uses `Option` and `Result`
 * in relevant places throughout the interface.
 *
 * @param entries
 * Seed entries for the map.
 */
export function createTypedMap<TKey, TValue>(entries?: [TKey, TValue][]) {
  return typedMap(new Map<TKey, TValue>(entries))
}

/**
 * A typed map.
 */
export const TypedMap = {
  /**
   * Creates a Typed Map from a normal Map.
   *
   * WARNING: By default, when creating a `TypedMap` from an existing `Map`,
   * a copy is made of the original map. Set the `copy` flag to `false` to
   * prevent this. A copy is made to prevent `TypedMap` from operating on
   * a reference to the original map provided. Without copying, changes made
   * to the original map would be reflected within the `TypedMap`.
   *
   * If copying the map incurs too large of a performance penalty, you can pass
   * `false` as the second parameter, so that only the reference is copied. But, be
   * aware that this could lead to unstable behavior if any code writes to the original
   * reference/map.
   *
   * @param map
   * The `Map` to create `TypedMap` from.
   *
   * @param copy
   * Indicates whether the provided `Map` should be copied into `TypedMap`, or
   * whether the reference should be shared. Share the reference by passing `true`
   * if you must for performance.
   */
  from<TKey, TValue>(
    map: Map<TKey, TValue>,
    copy = true
  ): ITypedMap<TKey, TValue> {
    return copy ? typedMap(new Map(Array.from(map))) : typedMap(map)
  },
}
