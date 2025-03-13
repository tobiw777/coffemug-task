import { CommandInterface, CommandParamsType, CommandReturnType, ICommandBus } from '@application/interfaces/command';
import { logger } from '@src/utils/logger';
import { Service } from 'typedi';

@Service()
export class CommandBus implements ICommandBus {
  protected commands: Record<string, CommandInterface<any, any>> = {};

  public register(command: CommandInterface<any>): void {
    const type = command.constructor.name;

    if (this.commands[type]) throw new Error(`Duplicated command: ${type}`);

    this.commands[type] = command;
  }

  public async execute<T extends CommandInterface<any, any>>(
    constructor: new (...args: any[]) => T,
    params?: CommandParamsType<T>,
  ): Promise<CommandReturnType<T>> {
    const type = constructor.name;
    const command = this.commands[type];

    if (!command) throw new Error(`Command ${type} not found`);

    logger.debug('Executing command: ' + JSON.stringify({ data: { type: type, params: params } }));

    const result = await command.handle(params);

    logger.debug('Command has been executed: ' + JSON.stringify({ data: { type: type, result: result } }));

    return result;
  }
}
