import { ICommandQueryResult } from './query';

export interface CommandInterface<T extends object, P = void | ICommandQueryResult> {
  handle(params: T): Promise<P>;
}

export type CommandParamsType<T extends CommandInterface<any, any>> =
  T extends CommandInterface<infer U, any> ? U : never;
export type CommandReturnType<T extends CommandInterface<any, any>> =
  T extends CommandInterface<any, infer U> ? U : never;

export interface ICommandBus {
  register(command: CommandInterface<any, any>): void;

  execute<T extends CommandInterface<any, any>>(
    type: new (...args: any[]) => T,
    params?: CommandParamsType<T>,
  ): Promise<CommandReturnType<T>>;
}
