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
  constructor(message: string, public code: string = 'error') {
    super(message);
    this.name = 'CustomError';
  }

  static from(response: ErrorData): CustomError {
    return new CustomError(response.errors[0].detail, response.errors[0].code);
  }
}
