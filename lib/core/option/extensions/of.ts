import { IOptionExtensions, none, Option, some } from '..'

/**
 * @see {@link IOptionExtensions.of}
 */
export const of: IOptionExtensions['of'] = (value) => {
  if (value === null || value === undefined) {
    return none()
  }

  if (typeof value === 'string' && value.length === 0) {
    return none()
  }

  return some(value!)
}
