/**
 * Utility functions for error handling and serialization
 */

export function serializeError(error: unknown): string {
  if (error === null || error === undefined) {
    return 'An unknown error occurred';
  }

  if (error instanceof Error) {
    return `${error.name}: ${error.message}`;
  }

  if (typeof error === 'string') {
    return error || 'An unknown error occurred';
  }

  if (typeof error === 'object' && error !== null) {
    try {
      const errorObj = error as Record<string, unknown>;

      if ('status' in errorObj && 'data' in errorObj) {
        const status = errorObj.status;
        const data = errorObj.data;

        if (typeof data === 'object' && data !== null) {
          const dataObj = data as Record<string, unknown>;
          if (dataObj.message) {
            return `Error ${status}: ${String(dataObj.message)}`;
          }
          if (dataObj.error) {
            return `Error ${status}: ${String(dataObj.error)}`;
          }
        }

        if (typeof data === 'string') {
          return `Error ${status}: ${data}`;
        }

        return `Request failed with status ${status}`;
      }

      if (errorObj.message) {
        return String(errorObj.message);
      }
      if (errorObj.error) {
        return String(errorObj.error);
      }

      if (
        errorObj.data &&
        typeof errorObj.data === 'object' &&
        errorObj.data !== null
      ) {
        const dataObj = errorObj.data as Record<string, unknown>;
        if (dataObj.message) {
          return String(dataObj.message);
        }
      }

      const stringified = JSON.stringify(error, null, 2);
      if (stringified && stringified !== '{}') {
        return stringified;
      }

      return 'An unknown error occurred';
    } catch {
      return `[Object: ${Object.prototype.toString.call(error)}]`;
    }
  }

  const stringValue = String(error);
  return stringValue || 'An unknown error occurred';
}

export function serializeErrorWithStackOnlyMessage(error: unknown): string {
  if (error instanceof Error) {
    return `${error.name}: ${error.message}${error.stack ? '\n' + error.stack : ''}`;
  }

  return serializeError(error);
}

export function serializeErrorWithStack(error: unknown): string {
  if (error instanceof Error) {
    return [
      `Name: ${error.name}`,
      `Message: ${error.message}`,
      error.stack ? `Stack:\n${error.stack}` : undefined,
    ]
      .filter(Boolean)
      .join('\n');
  }

  try {
    return `Non-Error value: ${JSON.stringify(error, null, 2)}`;
  } catch {
    return `Unserializable error: ${String(error)}`;
  }
}
