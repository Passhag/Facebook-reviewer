import 'reflect-metadata';
import { Container, interfaces } from 'inversify';
import getDecorators from 'inversify-inject-decorators';
import { Auth } from './interfaces';
import { ProviderTypes, FbProvider } from './entities';
import { Types } from './types';

const container = new Container();

container.bind<interfaces.Factory<Auth>>(Types.AuthFactory)
  .toFactory<Auth>((context: interfaces.Context) => (providerType: ProviderTypes) => {
    switch (providerType) {
      case ProviderTypes.Facebook: {
        if (!context.container.isBound(Types.Auth)) {
          container.bind<Auth>(Types.Auth).to(FbProvider);
        }
        return new FbProvider();
      }
      default: {
        throw new Error('Specified provider type is missing.');
      }
    }
  });

export const inject = getDecorators(container).lazyInject;

export {
  Types,
  container,
};
