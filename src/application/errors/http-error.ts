import { HttpError } from 'routing-controllers';

export class RestError extends HttpError {
  declare httpCode: number;
  public message: string;
  public detail?: string;
  public errors?: Record<string, string> = {};

  constructor(httpCode: number, message: string, detail?: string, errors?: Record<string, string>) {
    super(httpCode);
    this.message = message;
    this.detail = detail;
    this.errors = errors;
  }
}
