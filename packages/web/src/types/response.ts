export interface ErrorMessage {
  attr?: string;
  code: string;
  detail: string;
}

export interface ErrorData {
  type: string;
  errors: ErrorMessage[];
}

export class CustomError extends Error {
  constructor(message: string, public code: string = 'error', public description?: string) {
    super(message);
    this.name = 'CustomError';
  }

  static fromErrorData(response: ErrorData): CustomError {
    const errors = response.errors;
    if (errors.length === 0) {
      return new CustomError(`Unknown error. Please report this issue to the developers.`);
    }
    const error = errors[0];
    return new CustomError(`${error.detail} (${error.attr})`, error.code);
  }
}
