import { logger } from '@src/utils/logger';
import { Service } from 'typedi';
import { IQueryBus, QueryInterface, QueryParamsType, QueryReturnType } from '../interfaces/query';

@Service()
export class QueryBus implements IQueryBus {
  protected queries: Record<string, QueryInterface<any, any>> = {};

  public register(query: QueryInterface<any, any>): void {
    const type = query.constructor.name;

    if (this.queries[type]) throw new Error(`Query ${type} already exists`);

    this.queries[type] = query;
  }

  public async execute<T extends QueryInterface<any, any>>(
    constructor: new (...args: any[]) => T,
    params?: QueryParamsType<T>,
  ): Promise<QueryReturnType<T>> {
    const type = constructor.name;
    const query = this.queries[type];

    if (!query) throw new Error(`Query: ${type} not found`);

    logger.debug('Executing query: ' + JSON.stringify({ data: { type, params } }));

    const result = await query.handle(params);

    logger.debug('Query has been executed: ' + JSON.stringify({ data: { type } }));

    return result;
  }
}
