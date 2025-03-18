export interface QueryInterface<T extends object, P = void> {
  handle(params: T): Promise<P>;
}

export type QueryParamsType<T extends QueryInterface<any, any>> = T extends QueryInterface<infer U, any> ? U : never;
export type QueryReturnType<T extends QueryInterface<any, any>> = T extends QueryInterface<any, infer U> ? U : never;

export interface IQueryBus {
  register(query: QueryInterface<any, any>): void;

  execute<T extends QueryInterface<any, any>>(
    type: new (...args: any[]) => T,
    params?: QueryParamsType<T>,
  ): Promise<QueryReturnType<T>>;
}

export interface ICommandQueryError {
  title: string;
  message: string;
  error?: Error | any;
  statusCode: number;
}

export interface ICommandQueryResult {
  result: CommandQueryResult;
  error?: ICommandQueryError | null;
}

export enum CommandQueryResult {
  OK = 'OK',
  FAILED = 'FAILED',
  PARTLY = 'PARTLY_SUCCEED',
}
