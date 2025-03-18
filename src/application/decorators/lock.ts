import { LockService } from '@infrastructure/services/lock-service';
import { Container } from 'typedi';

type Resources = string[];

type ResourcesFactory = (...args: any[]) => Resources;

type TypedMethodDecorator<T> = (
  target: object,
  propertyKey: string | symbol,
  descriptor: TypedPropertyDescriptor<T>,
) => TypedPropertyDescriptor<T> | void;

export function Lock<T extends ResourcesFactory>(resources: T): TypedMethodDecorator<(...args: Parameters<T>) => any> {
  return (target: object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    const lockService = Container.get(LockService);

    const originalMethod: any = descriptor.value;

    descriptor.value = function (...args: any[]) {
      const callback = () => originalMethod.apply(this, args);
      const resourcesToUse = resources(...args);

      return lockService.wrap(callback, resourcesToUse);
    };
  };
}
