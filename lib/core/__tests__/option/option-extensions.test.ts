import { none, Option, some } from '../../option'
import { OptionOperator } from '../../option/extensions/interfaces'

describe('map', () => {
  test('Option.map of Some maps the inner value correctly', () => {
    expect(
      fromNumber(2)
        .pipe(Option.map((x) => x * 2))
        .unwrap()
    ).toEqual(4)
  })

  test('Option.map of None returns None', () => {
    expect(
      fromNumber(-1)
        .pipe(Option.map((x) => x * 2))
        .isNone()
    ).toBe(true)
  })
})

describe('mapAsync', () => {
  test('option.mapAsync of Some maps the inner value correctly', async () => {
    expect(
      await fromNumber(2)
        .pipe(Option.mapAsync((x) => Promise.resolve(x * 2)))
        .then(Option.unwrap())
    ).toEqual(4)
  })

  test('option.mapAsync of None returns None', async () => {
    expect(
      await testPipe(
        fromNumber(-1),
        Option.mapAsync((x) => Promise.resolve(x))
      ).then(Option.isNone())
    ).toBe(true)
  })
})

describe('chain', () => {
  test('Option.chain of Some maps and flattens the result', () => {
    expect(
      testPipe(
        fromNumber(2),
        Option.chain((x) => some(x * 2))
      ).unwrap()
    ).toEqual(4)
  })

  test('Option.chain of None returns None', () => {
    expect(
      testPipe(
        fromNumber(-1),
        Option.chain((x) => some(x * 2))
      ).isNone()
    ).toBe(true)
  })

  test('Option.chain of Some mapping to None returns None', () => {
    expect(testPipe(fromNumber(2), Option.chain(none)).isNone()).toBe(true)
  })
})

describe('chainAsync', () => {
  test('Option.chainAsync of Some maps and flattens the result', async () => {
    expect(
      await testPipe(
        fromNumber(2),
        Option.chainAsync(async (x) => some(x * 2))
      ).then(Option.unwrap())
    ).toEqual(4)
  })

  test('Option.chainAsync of None returns None', async () => {
    expect(
      await testPipe(
        fromNumber(-1),
        Option.chainAsync(async (x) => some(x * 2))
      ).then(Option.isNone())
    ).toBe(true)
  })

  test('Option.chainAsync of Some mapping to None returns None', async () => {
    expect(
      await testPipe(
        fromNumber(2),
        Option.chainAsync(async () => none())
      ).then(Option.isNone())
    ).toBe(true)
  })
})

describe('filter', () => {
  test('Option.filter of None returns None', () => {
    expect(
      testPipe(
        fromNumber(-1),
        Option.filter((x) => x > 0)
      ).isNone()
    ).toBe(true)
  })

  test('Option.filter of some returns itself when filter is satisfied', () => {
    const original = fromNumber(2)
    expect(
      testPipe(
        original,
        Option.filter((x) => x > 0)
      )
    ).toBe(original)
  })

  test('Option.filter of Some returns None when filter fails', () => {
    expect(
      testPipe(
        fromNumber(2),
        Option.filter((x) => x < 0)
      ).isNone()
    ).toBe(true)
  })
})

describe('filterAsync', () => {
  test('Option.filterAsync of None returns None', async () => {
    expect(
      await testPipe(
        fromNumber(-1),
        Option.filterAsync(async (x) => x > 0)
      ).then(Option.isNone())
    ).toBe(true)
  })

  test('Option.filterAsync of Some returns itself when filter is satisfied', async () => {
    const original = fromNumber(2)
    expect(
      await testPipe(
        original,
        Option.filterAsync(async (x) => x > 0)
      )
    ).toBe(original)
  })

  test('Option.filterAsync of Some returns None when filter fails', async () => {
    expect(
      await testPipe(
        fromNumber(2),
        Option.filterAsync(async (x) => x < 0)
      ).then(Option.isNone())
    ).toBe(true)
  })
})

describe('forEach', () => {
  test('Option.forEach of Some runs the function once for the inner value', () => {
    const fn = jest.fn()
    testPipe(fromNumber(2), Option.forEach(fn))

    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith(2)
  })

  test('Option.forEach of None never runs the function', () => {
    const fn = jest.fn()
    testPipe(fromNumber(-1), Option.forEach(fn))

    expect(fn).toHaveBeenCalledTimes(0)
  })
})

describe('forEachAsync', () => {
  test('Option.forEachAsync of Some runs the function once for the inner value', async () => {
    const fn = jest.fn()
    await testPipe(fromNumber(2), Option.forEachAsync(fn))

    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith(2)
  })

  test('Option.forEachAsync of None never runs the function', async () => {
    const fn = jest.fn()
    await testPipe(fromNumber(-1), Option.forEachAsync(fn))

    expect(fn).toHaveBeenCalledTimes(0)
  })
})

describe('tap', () => {
  test('Option.tap of Some runs the function once for the inner value', () => {
    const fn = jest.fn()
    testPipe(fromNumber(2), Option.tap(fn))

    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith(2)
  })

  test('Option.tap of None never runs the function', () => {
    const fn = jest.fn()
    testPipe(fromNumber(-1), Option.tap(fn))

    expect(fn).toHaveBeenCalledTimes(0)
  })
})

describe('tapAsync', () => {
  test('Option.tapAsync of Some runs the function once for the inner value', async () => {
    const fn = jest.fn(async (x) => x)
    await testPipe(fromNumber(2), Option.tapAsync(fn))

    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith(2)
  })

  test('Option.tapAsync of None never runs the function', async () => {
    const fn = jest.fn()
    await testPipe(fromNumber(-1), Option.tapAsync(fn))

    expect(fn).toHaveBeenCalledTimes(0)
  })
})

describe('unwrap', () => {
  test('Option.unwrap of Some unwraps the inner value', () => {
    expect(testPipe(fromNumber(2), Option.unwrap())).toEqual(2)
  })

  test('Option.unwrap of None throws an error', () => {
    expect(() => testPipe(fromNumber(-1), Option.unwrap())).toThrowError()
  })
})

describe('unwrapOr', () => {
  test('Option.unwrapOr of Some unwraps the inner value', () => {
    expect(testPipe(fromNumber(2), Option.unwrapOr(4))).toEqual(2)
  })

  test('Option.unwrapOr of None returns the fallback value', () => {
    expect(testPipe(fromNumber(-1), Option.unwrapOr(4))).toEqual(4)
  })
})

describe('unwrapOrElse', () => {
  test('Option.unwrapOrElse of Some unwraps the inner value and does nothing', () => {
    const fn = jest.fn(() => 4)
    expect(testPipe(fromNumber(2), Option.unwrapOrElse(fn))).toEqual(2)

    expect(fn).toHaveBeenCalledTimes(0)
  })

  test("Option.unwrapOrElse of None should return the fallback function's result", () => {
    const fn = jest.fn(() => 4)
    expect(testPipe(fromNumber(-1), Option.unwrapOrElse(fn))).toEqual(4)

    expect(fn).toHaveBeenCalledTimes(1)
  })
})

describe('unwrapOrElseAsync', () => {
  test('Option.unwrapOrElseAsync of Some unwraps the inner value and does nothing', async () => {
    const fn = jest.fn(async () => 4)
    expect(await testPipe(fromNumber(2), Option.unwrapOrElseAsync(fn))).toEqual(
      2
    )

    expect(fn).toHaveBeenCalledTimes(0)
  })

  test("Option.unwrapOrElseAsync of None should return the fallback function's result", async () => {
    const fn = jest.fn(async () => 4)
    expect(
      await testPipe(fromNumber(-1), Option.unwrapOrElseAsync(fn))
    ).toEqual(4)

    expect(fn).toHaveBeenCalledTimes(1)
  })
})

describe('isNone', () => {
  test('option.isNone of Some should return false', () => {
    expect(testPipe(fromNumber(2), Option.isNone())).toBe(false)
  })

  test('option.isNone of None should return true', () => {
    expect(testPipe(fromNumber(-1), Option.isNone())).toBe(true)
  })
})

describe('isSome', () => {
  test('option.isSome of Some should return true', () => {
    expect(testPipe(fromNumber(2), Option.isSome())).toBe(true)
  })

  test('option.isSome of None should return false', () => {
    expect(testPipe(fromNumber(-1), Option.isSome())).toBe(false)
  })
})

describe('toResult', () => {
  test('Option.toResult of Some should return Ok', () => {
    const result = fromNumber(2).pipe(Option.toResult())
    expect(result.isOk()).toBe(true)
    expect(result.unwrap()).toEqual(2)
  })

  test('Option.toResult of None should return Err', () => {
    const result = fromNumber(-1).pipe(Option.toResult())
    expect(result.isErr()).toBe(true)
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
