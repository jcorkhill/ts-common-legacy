import { identity } from '../identity'
import { Option, none, some } from '../option'

describe('map', () => {
  test('option.map of Some maps the inner value correctly', () => {
    // Arrange
    const original = some(2)

    // Act
    const mapped = original.map((x) => x * 2)

    // Assert
    expect(mapped.unwrap()).toBe(4)
  })

  test('option.map of None returns None', () => {
    //  Arrange
    const original = none() as Option<number>

    // Act
    const mapped = original.map((x) => x * 2)

    // Assert
    expect(mapped.isNone()).toBe(true)
  })
})

describe('chain', () => {
  test('option.chain of Some maps and flattens the result', () => {
    // Arrange
    const original = some(2)

    // Act
    const chained = original.chain((x) => some(x * 2))

    // Assert
    expect(chained.unwrap()).toBe(4)
  })

  test('option.chain of None returns None', () => {
    // Arrange
    const original = none() as Option<number>

    // Act
    const chained = original.chain((x) => some(x * 4))

    // Assert
    expect(chained.isNone()).toBe(true)
  })

  test('option.chain of Some mapping to None returns None', () => {
    // Arrange
    const original = some(2)

    // Act
    const chained = original.chain(none)

    // Assert
    expect(chained.isNone()).toBe(true)
  })
})

describe('filter', () => {
  test('option.filter of None returns None', () => {
    // Arrange
    const original = none() as Option<number>

    // Act
    const result = original.filter((x) => x > 0)

    // Assert
    expect(result.isNone()).toEqual(true)
  })

  test('option.filter of Some returns itself when filter is satisfied', () => {
    // Arrange
    const original = some(2)

    // Act
    const result = original.filter((x) => x > 0)

    // Assert
    expect(result).toBe(original)
  })

  test('option.filter of Some returns None when filter fails', () => {
    // Arrange
    const original = some(2)

    // Act
    const result = original.filter((x) => x < 0)

    // Assert
    expect(result.isNone()).toEqual(true)
  })
})

describe('match', () => {
  test('option.match of Some returns the value of the "Some" arm', () => {
    // Arrange
    const value = 2
    const option = some(value)

    // Act
    const result = option.match({
      Some: identity,
      None: () => 0,
    })

    // Assert
    expect(result).toBe(value)
  })

  test('option.match of None returns the value of the "None" arm', () => {
    // Arrange
    const option = none() as Option<number>

    // Act
    const result = option.match({
      Some: identity,
      None: () => 4,
    })

    // Assert
    expect(result).toBe(4)
  })
})

describe('forEach', () => {
  test('option.forEach of Some runs the function once for the inner value', () => {
    // Arrange
    const option = some(4)
    const fn = jest.fn()

    // Act
    option.forEach(fn)

    // Assert
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith(4)
  })

  test('option.forEach of None never runs the function', () => {
    // Arrange
    const option = none() as Option<number>
    const fn = jest.fn()

    // Act
    option.forEach(fn)

    // Assert
    expect(fn).toHaveBeenCalledTimes(0)
  })
})

describe('unwrap', () => {
  test('option.unwrap of Some unwraps the inner value', () => {
    // Arrange
    const option = some(2)

    // Act
    const result = option.unwrap()

    // Assert
    expect(result).toEqual(2)
  })

  test('option.unwrap of None throws an error', () => {
    // Arrange
    const option = none()

    // Act, Assert
    expect(() => option.unwrap()).toThrowError()
  })
})

describe('unwrapOr', () => {
  test('option.unwrapOr of Some unwraps the inner value', () => {
    // Arrange
    const option = some(2)

    // Act
    const result = option.unwrapOr(4)

    // Assert
    expect(result).toEqual(2)
  })

  test('option.unwrapOr of None returns the fallback value', () => {
    // Arrange
    const option = none() as Option<number>

    // Act
    const result = option.unwrapOr(4)

    // Assert
    expect(result).toEqual(result)
  })
})

describe('unwrapOrDo', () => {
  test('option.unwrapOrDo of Some unwraps the inner value and does nothing', () => {
    // Arrange
    const option = some(2)
    const fn = jest.fn(() => 4)

    // Act
    const result = option.unwrapOrDo(fn)

    // Assert
    expect(result).toEqual(2)
    expect(fn).toHaveBeenCalledTimes(0)
  })

  test("option.unwrapOrDo of None should return the fallback function's result", () => {
    // Arrange
    const option = none() as Option<number>
    const fn = jest.fn(() => 4)

    // Act
    const result = option.unwrapOrDo(fn)

    // Assert
    expect(result).toEqual(4)
    expect(fn).toHaveBeenCalledTimes(1)
  })
})

describe('isNone', () => {
  test('option.isNone of Some should return false', () => {
    // Arrange
    const option = some(2)

    // Act
    const result = option.isNone()

    // Assert
    expect(result).toEqual(false)
  })

  test('option.isNone of None should return true', () => {
    // Arrange
    const option = none()

    // Act
    const result = option.isNone()

    // Assert
    expect(result).toEqual(true)
  })
})

describe('isSome', () => {
  test('option.isSome of Some should return true', () => {
    // Arrange
    const option = some(2)

    // Act
    const result = option.isSome()

    // Assert
    expect(result).toEqual(true)
  })

  test('option.isSome of None should return false', () => {
    // Arrange
    const option = none()

    // Act
    const result = option.isSome()

    // Assert
    expect(result).toEqual(false)
  })
})
