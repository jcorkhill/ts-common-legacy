import { ResultOperator } from './../result'
import { identity } from '../identity'
import { err, ok, Result } from '../result'

describe('map', () => {
  test('result.map of Ok maps the inner value correctly', () => {
    expect(
      fromNumber(2)
        .map((x) => x * 2)
        .unwrap()
    ).toEqual(4)
  })

  test('result.map of Err returns Err', () => {
    expect(
      fromNumber(-1)
        .map((x) => x * 2)
        .isErr()
    ).toBe(true)
  })
})

describe('mapErr', () => {
  test('result.mapErr of Ok return Ok', () => {
    const fn = jest.fn(() => 'new error')
    expect(fromNumber(2).mapErr(fn).isOk()).toBe(true)
    expect(fn).toHaveBeenCalledTimes(0)
  })

  test('result.mapErr of Err maps the error', () => {
    expect(
      fromNumber(-1)
        .mapErr(() => 0)
        .match({
          Ok: identity,
          Err: identity,
        })
    ).toEqual(0)
  })
})

describe('mapErrAsync', () => {
  test('result.mapErrAsync of Ok returns Ok', async () => {
    const fn = jest.fn(async () => 'new error')

    expect(await fromNumber(2).mapErrAsync(fn).then(Result.isOk())).toBe(true)
    expect(fn).toHaveBeenCalledTimes(0)
  })

  test('result.mapErrAsync of Err maps the error', async () => {
    expect(
      await fromNumber(-1)
        .mapErrAsync(async () => 0)
        .then(
          Result.match({
            Ok: identity,
            Err: identity,
          })
        )
    ).toEqual(0)
  })
})

describe('mapAsync', () => {
  test('result.mapAsync of Ok maps the inner value correctly', async () => {
    expect(
      await fromNumber(2)
        .mapAsync((x) => Promise.resolve(x * 2))
        .then(Result.unwrap())
    ).toEqual(4)
  })

  test('result.mapAsync of Err returns Err', async () => {
    expect(
      await fromNumber(-1)
        .mapAsync((x) => Promise.resolve(x * 2))
        .then(Result.isErr())
    ).toBe(true)
  })
})

describe('chain', () => {
  test('result.chain of Ok maps and flattens the result', () => {
    expect(
      fromNumber(2)
        .chain((x) => ok(x * 2))
        .unwrap()
    ).toEqual(4)
  })

  test('result.chain of Err returns Err', () => {
    expect(
      fromNumber(-1)
        .chain((x) => ok(x * 2))
        .isErr()
    ).toBe(true)
  })

  test('result.chain of Ok mapping to Err returns Err', () => {
    expect(fromNumber(2).chain(err).isErr()).toBe(true)
  })
})

describe('chainAsync', () => {
  test('result.chainAsync of Ok maps and flattens the result', async () => {
    expect(
      await fromNumber(2)
        .chainAsync(async (x) => ok(x * 2))
        .then(Result.unwrap())
    ).toEqual(4)
  })

  test('result.chainAsync of Err returns Err', async () => {
    expect(
      await fromNumber(-1)
        .chainAsync(async (x) => ok(x * 2))
        .then(Result.isErr())
    ).toBe(true)
  })

  test('result.chainAsync of Ok mapping to Err returns Err', async () => {
    expect(
      await fromNumber(2)
        .chainAsync(async () => fromNumber(-1))
        .then(Result.isErr())
    ).toBe(true)
  })
})

describe('match', () => {
  test('result.match of Ok returns the value of the "Ok" arm', () => {
    expect(
      fromNumber(2).match({
        Ok: identity,
        Err: () => 0,
      })
    ).toEqual(2)
  })

  test('result.match of Err returns the value of the "Err" arm', () => {
    expect(
      fromNumber(-1).match({
        Ok: identity,
        Err: () => 4,
      })
    ).toEqual(4)
  })
})

describe('unwrap', () => {
  test('result.unwrap of Ok unwraps the inner value', () => {
    expect(fromNumber(2).unwrap()).toEqual(2)
  })

  test('result.unwrap of Err throws an error', () => {
    expect(() => fromNumber(-1).unwrap()).toThrowError()
  })
})

describe('unwrapOr', () => {
  test('result.unwrapOr of Ok unwraps the inner value', () => {
    expect(fromNumber(2).unwrapOr(4)).toEqual(2)
  })

  test('result.unwrapOr of Err returns the fallback value', () => {
    expect(fromNumber(-1).unwrapOr(4)).toEqual(4)
  })
})

describe('unwrapOrElse', () => {
  test('result.unwrapOrElse of Ok unwraps the inner value and does nothing', () => {
    const fn = jest.fn(() => 4)
    const result = fromNumber(2).unwrapOrElse(fn)

    expect(result).toEqual(2)
    expect(fn).toHaveBeenCalledTimes(0)
  })

  test("result.unwrapOrElse of Err should return the fallback function's result", () => {
    const fn = jest.fn(() => 4)
    const result = fromNumber(-1).unwrapOrElse(fn)

    expect(result).toEqual(4)
    expect(fn).toHaveBeenCalledTimes(1)
  })
})
describe('unwrapOrElseAsync', () => {
  test('result.unwrapOrElseAsync of Ok unwraps the inner value and does nothing', async () => {
    const fn = jest.fn(async () => 4)
    const result = await fromNumber(2).unwrapOrElseAsync(fn)

    expect(result).toEqual(2)
    expect(fn).toHaveBeenCalledTimes(0)
  })

  test("result.unwrapOrElseAsync of Err should return the fallback function's result", async () => {
    const fn = jest.fn(async () => 4)
    const result = await fromNumber(-1).unwrapOrElseAsync(fn)

    expect(result).toEqual(4)
    expect(fn).toHaveBeenCalledTimes(1)
  })
})

describe('unwrapErr', () => {
  test('result.unwrapErr of Ok should throw an error', () => {
    expect(() => fromNumber(2).unwrapErr()).toThrow()
  })

  test('result.unwrapErr of Err to return the error', () => {
    expect(fromNumber(-1).unwrapErr()).toEqual(CannotBeNegativeError(-1))
  })
})

describe('isErr', () => {
  test('result.isErr of Ok should return false', () => {
    expect(fromNumber(2).isErr()).toBe(false)
  })

  test('result.isErr of Err should return true', () => {
    expect(fromNumber(-1).isErr()).toBe(true)
  })
})

describe('isOk', () => {
  test('result.isOk of Ok should return true', () => {
    expect(fromNumber(2).isOk()).toBe(true)
  })

  test('result.isOk of Err should return false', () => {
    expect(fromNumber(-1).isOk()).toBe(false)
  })
})

describe('result operators', () => {
  describe('map', () => {
    test('Result.map of Ok maps the inner value correctly', () => {
      expect(
        testPipe(
          fromNumber(2),
          Result.map((x) => x * 2)
        ).unwrap()
      ).toEqual(4)
    })

    test('Result.map of Err returns Err', () => {
      expect(
        testPipe(
          fromNumber(-1),
          Result.map((x) => x * 2)
        ).isErr()
      ).toBe(true)
    })
  })

  describe('mapAsync', () => {
    test('Result.mapAsync of Ok maps the inner value correctly', async () => {
      expect(
        await testPipe(
          fromNumber(2),
          Result.mapAsync((x) => Promise.resolve(x * 2))
        ).then(Result.unwrap())
      ).toEqual(4)
    })

    test('Result.mapAsync of Err returns Err', async () => {
      expect(
        await testPipe(
          fromNumber(-1),
          Result.mapAsync((x) => Promise.resolve(x))
        ).then(Result.isErr())
      ).toBe(true)
    })
  })

  describe('mapErr', () => {
    test('Result.mapErr of Ok returns Ok', () => {
      const fn = jest.fn(() => 'new error')
      expect(testPipe(fromNumber(2), Result.mapErr(fn)).isOk()).toBe(true)
      expect(fn).toHaveBeenCalledTimes(0)
    })

    test('Result.mapErr of Err maps the error', () => {
      expect(
        testPipe(
          fromNumber(-1),
          Result.mapErr(() => 0)
        ).match({
          Ok: identity,
          Err: identity,
        })
      ).toEqual(0)
    })
  })

  describe('mapErrAsync', () => {
    test('Result.mapErrAsync of Ok returns Ok', async () => {
      const fn = jest.fn(async () => 'new error')
      expect(
        await testPipe(fromNumber(2), Result.mapErrAsync(fn)).then(
          Result.isOk()
        )
      ).toBe(true)

      expect(fn).toHaveBeenCalledTimes(0)
    })

    test('Result.mapErrAsync of Err maps the error', async () => {
      expect(
        await testPipe(
          fromNumber(-1),
          Result.mapErrAsync(async () => 0)
        ).then(
          Result.match({
            Ok: identity,
            Err: identity,
          })
        )
      ).toEqual(0)
    })
  })

  describe('chain', () => {
    test('Result.chain of Ok maps and flattens the result', () => {
      expect(
        testPipe(
          fromNumber(2),
          Result.chain((x) => ok(x * 2))
        ).unwrap()
      ).toEqual(4)
    })

    test('Result.chain of Err returns Err', () => {
      expect(
        testPipe(
          fromNumber(-1),
          Result.chain((x) => ok(x * 2))
        ).isErr()
      ).toBe(true)
    })

    test('Result.chain of Ok mapping to Err returns Err', () => {
      expect(testPipe(fromNumber(2), Result.chain(err)).isErr()).toBe(true)
    })
  })

  describe('chainAsync', () => {
    test('Result.chainAsync of Ok maps and flattens the result', async () => {
      expect(
        await testPipe(
          fromNumber(2),
          Result.chainAsync(async (x) => ok(x * 2))
        ).then(Result.unwrap())
      ).toEqual(4)
    })

    test('Result.chainAsync of Err returns Err', async () => {
      expect(
        await testPipe(
          fromNumber(-1),
          Result.chainAsync(async (x) => ok(x * 2))
        ).then(Result.isErr())
      ).toBe(true)
    })

    test('Result.chainAsync of Ok mapping to Err returns Err', async () => {
      expect(
        await testPipe(
          fromNumber(2),
          Result.chainAsync(async () => err(0))
        ).then(Result.isErr())
      ).toBe(true)
    })
  })

  describe('unwrap', () => {
    test('Result.unwrap of Ok unwraps the inner value', () => {
      expect(testPipe(fromNumber(2), Result.unwrap())).toEqual(2)
    })

    test('Result.unwrap of Ok throws an error', () => {
      expect(() => testPipe(fromNumber(-1), Result.unwrap())).toThrowError()
    })
  })

  describe('unwrapOr', () => {
    test('Result.unwrapOr of Ok unwraps the inner value', () => {
      expect(testPipe(fromNumber(2), Result.unwrapOr(4))).toEqual(2)
    })

    test('Result.unwrapOr of Ok returns the fallback value', () => {
      expect(testPipe(fromNumber(-1), Result.unwrapOr(4))).toEqual(4)
    })
  })

  describe('unwrapOrElse', () => {
    test('Result.unwrapOrElse of Ok unwraps the inner value and does nothing', () => {
      const fn = jest.fn(() => 4)
      expect(testPipe(fromNumber(2), Result.unwrapOrElse(fn))).toEqual(2)

      expect(fn).toHaveBeenCalledTimes(0)
    })

    test("Result.unwrapOrElse of Ok should return the fallback function's result", () => {
      const fn = jest.fn(() => 4)
      expect(testPipe(fromNumber(-1), Result.unwrapOrElse(fn))).toEqual(4)

      expect(fn).toHaveBeenCalledTimes(1)
    })
  })

  describe('unwrapOrElseAsync', () => {
    test('Result.unwrapOrElseAsync of Ok unwraps the inner value and does nothing', async () => {
      const fn = jest.fn(async () => 4)
      expect(
        await testPipe(fromNumber(2), Result.unwrapOrElseAsync(fn))
      ).toEqual(2)

      expect(fn).toHaveBeenCalledTimes(0)
    })

    test("Result.unwrapOrElseAsync of Ok should return the fallback function's result", async () => {
      const fn = jest.fn(async () => 4)
      expect(
        await testPipe(fromNumber(-1), Result.unwrapOrElseAsync(fn))
      ).toEqual(4)

      expect(fn).toHaveBeenCalledTimes(1)
    })
  })

  describe('isErr', () => {
    test('Result.isErr of Ok should return false', () => {
      expect(testPipe(fromNumber(2), Result.isErr())).toBe(false)
    })

    test('Result.isErr of Err should return true', () => {
      expect(testPipe(fromNumber(-1), Result.isErr())).toBe(true)
    })
  })

  describe('isOk', () => {
    test('Result.isOk of Ok should return true', () => {
      expect(testPipe(fromNumber(2), Result.isOk())).toBe(true)
    })

    test('Result.isOk of Err should return false', () => {
      expect(testPipe(fromNumber(-1), Result.isOk())).toBe(false)
    })
  })
})

type CannotBeNegativeError = {
  tag: 'CannotBeNegativeError'
  value: number
}

function CannotBeNegativeError(x: number): CannotBeNegativeError {
  return { tag: 'CannotBeNegativeError', value: x }
}

function fromNumber(x: number): Result<CannotBeNegativeError, number> {
  return x > 0 ? ok(x) : err(CannotBeNegativeError(x))
}

function testPipe<R>(
  r: Result<CannotBeNegativeError, number>,
  operator: ResultOperator<CannotBeNegativeError, number, R>
) {
  return operator(r)
}
