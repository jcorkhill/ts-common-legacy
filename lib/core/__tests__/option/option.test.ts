import { identity } from '../../identity'
import { Option, none, some, OptionOperator } from '../../option/index'

describe('map', () => {
  test('option.map of Some maps the inner value correctly', () => {
    expect(
      fromNumber(2)
        .map((x) => x * 2)
        .unwrap()
    ).toEqual(4)
  })

  test('option.map of None returns None', () => {
    expect(
      fromNumber(-1)
        .map((x) => x * 2)
        .isNone()
    ).toBe(true)
  })
})

describe('mapAsync', () => {
  test('option.mapAsync of Some maps the inner value correctly', async () => {
    expect(
      await fromNumber(2)
        .mapAsync((x) => Promise.resolve(x * 2))
        .then(Option.unwrap())
    ).toEqual(4)
  })

  test('option.mapAsync of None returns None', async () => {
    expect(
      await fromNumber(-1)
        .mapAsync((x) => Promise.resolve(x * 2))
        .then(Option.isNone())
    ).toBe(true)
  })
})

describe('chain', () => {
  test('option.chain of Some maps and flattens the result', () => {
    expect(
      fromNumber(2)
        .chain((x) => some(x * 2))
        .unwrap()
    ).toEqual(4)
  })

  test('option.chain of None returns None', () => {
    expect(
      fromNumber(-1)
        .chain((x) => some(x * 2))
        .isNone()
    ).toBe(true)
  })

  test('option.chain of Some mapping to None returns None', () => {
    expect(fromNumber(2).chain(none).isNone()).toBe(true)
  })
})

describe('chainAsync', () => {
  test('option.chainAsync of Some maps and flattens the result', async () => {
    expect(
      await fromNumber(2)
        .chainAsync(async (x) => some(x * 2))
        .then(Option.unwrap())
    ).toEqual(4)
  })

  test('option.chainAsync of None returns None', async () => {
    expect(
      await fromNumber(-1)
        .chainAsync(async (x) => some(x * 2))
        .then(Option.isNone())
    ).toBe(true)
  })

  test('option.chainAsync of Some mapping to None returns None', async () => {
    expect(
      await fromNumber(2)
        .chainAsync(async () => none())
        .then(Option.isNone())
    ).toBe(true)
  })
})

describe('filter', () => {
  test('option.filter of None returns None', () => {
    expect(
      fromNumber(-1)
        .filter((x) => x > 0)
        .isNone()
    ).toBe(true)
  })

  test('option.filter of Some returns itself when filter is satisfied', () => {
    const original = fromNumber(2)
    expect(original.filter((x) => x > 0)).toBe(original)
  })

  test('option.filter of Some returns None when filter fails', () => {
    expect(
      fromNumber(2)
        .filter((x) => x < 0)
        .isNone()
    ).toBe(true)
  })
})

describe('filterAsync', () => {
  test('option.filterAsync of None returns None', async () => {
    expect(
      await fromNumber(-1)
        .filterAsync(async (x) => x > 0)
        .then(Option.isNone())
    ).toBe(true)
  })

  test('option.filterAsync of Some returns itself when filter is satisfied', async () => {
    const original = fromNumber(2)
    expect(await original.filterAsync(async (x) => x > 0)).toBe(original)
  })

  test('option.filterAsync of Some returns None when filter fails', async () => {
    expect(
      await fromNumber(2)
        .filterAsync(async (x) => x < 0)
        .then(Option.isNone())
    ).toBe(true)
  })
})

describe('match', () => {
  test('option.match of Some returns the value of the "Some" arm', () => {
    // Arrange
    expect(
      fromNumber(2).match({
        Some: identity,
        None: () => 0,
      })
    ).toEqual(2)
  })

  test('option.match of None returns the value of the "None" arm', () => {
    expect(
      fromNumber(-1).match({
        Some: identity,
        None: () => 4,
      })
    ).toEqual(4)
  })
})

describe('forEach', () => {
  test('option.forEach of Some runs the function once for the inner value', () => {
    const fn = jest.fn()
    fromNumber(2).forEach(fn)

    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith(2)
  })

  test('option.forEach of None never runs the function', () => {
    const fn = jest.fn()
    fromNumber(-1).forEach(fn)

    expect(fn).toHaveBeenCalledTimes(0)
  })
})

describe('forEachAsync', () => {
  test('option.forEachAsync of Some runs the function once for the inner value', async () => {
    const fn = jest.fn()
    fromNumber(2).forEachAsync(fn)

    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith(2)
  })

  test('option.forEachAsync of None never runs the function', async () => {
    const fn = jest.fn()
    await fromNumber(-1).forEachAsync(fn)

    expect(fn).toHaveBeenCalledTimes(0)
  })
})

describe('tap', () => {
  test('option.tap of Some runs the function once for the inner value', () => {
    const fn = jest.fn()
    fromNumber(2).forEach(fn)

    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith(2)
  })

  test('option.tap of None never runs the function', () => {
    const fn = jest.fn()
    fromNumber(-1).tap(fn)

    expect(fn).toHaveBeenCalledTimes(0)
  })
})

describe('tapAsync', () => {
  test('option.tapAsync of Some runs the function once for the inner value', async () => {
    const fn = jest.fn(async (x) => x)
    fromNumber(2).tapAsync(fn)

    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith(2)
  })

  test('option.tapAsync of None never runs the function', () => {
    const fn = jest.fn(async (x) => x)
    fromNumber(-1).tapAsync(fn)

    expect(fn).toHaveBeenCalledTimes(0)
  })
})

describe('unwrap', () => {
  test('option.unwrap of Some unwraps the inner value', () => {
    expect(fromNumber(2).unwrap()).toEqual(2)
  })

  test('option.unwrap of None throws an error', () => {
    expect(() => fromNumber(-1).unwrap()).toThrowError()
  })
})

describe('unwrapOr', () => {
  test('option.unwrapOr of Some unwraps the inner value', () => {
    expect(fromNumber(2).unwrapOr(4)).toEqual(2)
  })

  test('option.unwrapOr of None returns the fallback value', () => {
    expect(fromNumber(-1).unwrapOr(4)).toEqual(4)
  })
})

describe('unwrapOrElse', () => {
  test('option.unwrapOrElse of Some unwraps the inner value and does nothing', () => {
    const fn = jest.fn(() => 4)
    const result = fromNumber(2).unwrapOrElse(fn)

    expect(result).toEqual(2)
    expect(fn).toHaveBeenCalledTimes(0)
  })

  test("option.unwrapOrElse of None should return the fallback function's result", () => {
    const fn = jest.fn(() => 4)
    const result = fromNumber(-1).unwrapOrElse(fn)

    expect(result).toEqual(4)
    expect(fn).toHaveBeenCalledTimes(1)
  })
})

describe('unwrapOrElseAsync', () => {
  test('option.unwrapOrElseAsync of Some unwraps the inner value and does nothing', async () => {
    const fn = jest.fn(async () => 4)
    const result = await fromNumber(2).unwrapOrElseAsync(fn)

    expect(result).toEqual(2)
    expect(fn).toHaveBeenCalledTimes(0)
  })

  test("option.unwrapOrElseAsync of None should return the fallback function's result", async () => {
    const fn = jest.fn(async () => 4)
    const result = await fromNumber(-1).unwrapOrElseAsync(fn)

    expect(result).toEqual(4)
    expect(fn).toHaveBeenCalledTimes(1)
  })
})

describe('isNone', () => {
  test('option.isNone of Some should return false', () => {
    expect(fromNumber(2).isNone()).toBe(false)
  })

  test('option.isNone of None should return true', () => {
    expect(fromNumber(-1).isNone()).toBe(true)
  })
})

describe('isSome', () => {
  test('option.isSome of Some should return true', () => {
    expect(fromNumber(2).isSome()).toBe(true)
  })

  test('option.isSome of None should return false', () => {
    expect(fromNumber(-1).isSome()).toBe(false)
  })
})

describe('toOption', () => {
  test('should convert null to None', () => {
    expect(Option.of(null).isNone()).toBe(true)
  })

  test('should convert undefined to None', () => {
    expect(Option.of(undefined).isNone()).toBe(true)
  })

  test('should convert empty string to None', () => {
    expect(Option.of('').isNone()).toBe(true)
  })

  test('should convert all other values to Some', () => {
    // TODO: Use property test here instead.
    expect(Option.of(0).isSome()).toBe(true)
    expect(Option.of({}).isSome()).toBe(true)
    expect(Option.of(true).isSome()).toBe(true)
    expect(Option.of(false).isSome()).toBe(true)
    expect(Option.of('hello').isSome()).toBe(true)
    expect(Option.of(10).isSome()).toBe(true)
  })
})

function fromNumber(x: number) {
  return x > 0 ? some(x) : none()
}

function testPipe<R1>(
  o: Option<number>,
  operatorOne: OptionOperator<number, R1>
) {
  return operatorOne(o)
}
