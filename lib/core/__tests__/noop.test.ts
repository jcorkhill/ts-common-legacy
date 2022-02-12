import { noop } from '../noop'

test('should return undefined', () => {
  expect(noop()).toBeUndefined()
})
