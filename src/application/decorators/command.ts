import { CommandInterface, ICommandBus } from '@application/interfaces/command';
import { CommandBus } from '@application/services/CommandBus';
import { Container } from 'typedi';

export function Command() {
  return (target: any) => {
    const commandBus: ICommandBus = Container.get(CommandBus);
    const command: CommandInterface<any> = Container.get(target);

    commandBus.register(command);

    return target;
  };
}
