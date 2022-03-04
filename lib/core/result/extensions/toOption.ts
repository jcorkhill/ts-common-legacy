import { some, none } from '../../option'
import { IResultExtensions } from './interfaces'

export const toOption: IResultExtensions['toOption'] = () => {
  return (result) =>
    result.match({
      Ok: some,
      Err: none,
    })
}
