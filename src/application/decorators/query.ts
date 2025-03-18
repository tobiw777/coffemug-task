import { IQueryBus, QueryInterface } from '@application/interfaces/query';
import { QueryBus } from '@application/services/QueryBus';
import { Container } from 'typedi';

export function Query() {
  return (target: any) => {
    const queryService: IQueryBus = Container.get(QueryBus);
    const query: QueryInterface<any, any> = Container.get(target);

    queryService.register(query);

    return target;
  };
}
