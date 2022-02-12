/**
 * Lazily constructs an error to defer capturing the stack trace
 * until the returned function is called.
 *
 * @param errorFactory
 * A function returning the constructed error. The stacktrace will
 * be captured lazily.
 *
 * @returns
 * A function that throws the error from `errorFactory`.
 */
export function throws(errorFactory: () => Error) {
  return () => {
    throw errorFactory()
  }
}
