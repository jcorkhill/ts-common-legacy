import { createTypedMap, ITypedMap, KeyNotFound, TypedMap } from '../map'

describe('clear', () => {
  test('should clear the map', () => {
    const map = createTypedMap([['key', 'value']])

    map.clear()

    expect(map.size).toEqual(0)
  })
})

describe('delete', () => {
  test('should delete the key and return Ok when key exists', () => {
    const toDelete = 'key1'
    const map = createTypedMap([
      [toDelete, 'value1'],
      ['key2', 'value2'],
    ])

    const result = map.delete(toDelete)

    expect(map.has(toDelete)).toBe(false)
    expect(result.isOk()).toBe(true)
  })

  test('should return Err when the key does not exist', () => {
    const map = createTypedMap([['key1', 'value1']])

    const result = map.delete('non-existent')

    expect(map.size).toEqual(1)
    expect(result.isErr()).toBe(true)
    expect(result.unwrapErr()).toEqual(KeyNotFound())
  })
})

describe('forEach', () => {
  test('should be called for each value', () => {
    const results: [string, string, ITypedMap<string, string>][] = []
    const map = createTypedMap([
      ['key1', 'value1'],
      ['key2', 'value2'],
    ])

    map.forEach((v, k, m) => results.push([v, k, m]))

    // First tuple
    expect(results[0][0]).toEqual('value1')
    expect(results[0][1]).toEqual('key1')
    assertMap(results[0][2])

    // Second tuple
    expect(results[1][0]).toEqual('value2')
    expect(results[1][1]).toEqual('key2')
    assertMap(results[1][2])

    function assertMap(toAssert: ITypedMap<string, string>) {
      expect(toAssert.get('key1').unwrap()).toEqual('value1')
      expect(toAssert.get('key2').unwrap()).toEqual('value2')
      expect(toAssert.size).toEqual(2)
    }
  })
})

describe('get', () => {
  test('should return Some with the value if the key exists', () => {
    const map = createTypedMap([['key', 'value']])

    const result = map.get('key')

    expect(result.isSome()).toBe(true)
    expect(result.unwrap()).toEqual('value')
  })

  test('should return None if the key does not exist', () => {
    const map = createTypedMap()

    const result = map.get('key')

    expect(result.isNone()).toBe(true)
  })
})

describe('has', () => {
  test('should return true if the key is found', () => {
    const map = createTypedMap([['key', 'value']])
    expect(map.has('key')).toBe(true)
  })

  test('should return false if the key cannot be found', () => {
    const map = createTypedMap()
    expect(map.has('key')).toBe(false)
  })
})

describe('set', () => {
  test('should set the value', () => {
    const map = createTypedMap()
    map.set('key', 'value')

    expect(map.has('key')).toBe(true)
  })

  test('should return a reference to itself', () => {
    const map = createTypedMap()
    const reference = map.set('key', 'value')

    expect(map).toBe(reference)
  })
})

describe('size', () => {
  test('should return the size of the map', () => {
    const map = createTypedMap()
    expect(map.size).toEqual(0)

    map.set('key', 'value')
    expect(map.size).toEqual(1)
  })
})

describe('TypedMap', () => {
  describe('from', () => {
    test('should copy the map when copy = true', () => {
      const map = new Map([['key1', 'value1']])
      const typedMap = TypedMap.from(map)

      map.delete('key1')
      expect(typedMap.get('key1').isSome()).toBe(true)
    })

    test('should reference the map when copy = false', () => {
      const map = new Map([['key1', 'value1']])
      const typedMap = TypedMap.from(map, false)

      map.delete('key1')
      expect(typedMap.get('key1').isNone()).toBe(true)
    })
  })
})
