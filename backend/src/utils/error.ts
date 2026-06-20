/** =================================================================
 *  ERROR UTILITY FUNCTIONS
 *  Safe type guards and error message extraction.
 *  ================================================================= */

export function isErrorWithMessage(error: unknown): error is { message: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message: string }).message === 'string'
  );
}

export function toErrorWithMessage(error: unknown): { message: string } {
  if (isErrorWithMessage(error)) return error;
  try {
    return { message: JSON.stringify(error) };
  } catch {
    return { message: String(error) };
  }
}

export function isAppError(error: unknown): error is { message: string; statusCode: number } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message: string }).message === 'string' &&
    'statusCode' in error &&
    typeof (error as { statusCode: number }).statusCode === 'number'
  );
}

export function getErrorMessage(error: unknown): string {
  if (isErrorWithMessage(error)) return error.message;
  return 'Unknown error';
}