import { IOptionExtensions, Option } from '..'
import { err, ok } from '../../result'

/**
 * Failure type for an absent value during the conversion from an `Option` to a `Result`.
 */
export type ValueAbsent = {
  type: 'ValueAbsent'
}

/**
 * `ValueAbsent` failure factory function.
 */
export function ValueNotFound(): ValueAbsent {
  return {
    type: 'ValueAbsent',
  }
}

export const toResult: IOptionExtensions['toResult'] = () => {
  return (o) =>
    o.match({
      Some: ok,
      None: () => err(ValueNotFound()),
    })
}
