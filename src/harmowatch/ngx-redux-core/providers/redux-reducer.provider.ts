import { Injectable } from '@angular/core';

import { ReduxStateProvider } from './redux-state.provider';
import { IRegisterStatePayload, ReduxRegistry } from './redux-registry';
import { ReduxRootState } from '../interfaces/redux-root-state.interface';
import { ReduxActionWithPayload } from '../interfaces/redux-action.interface';


@Injectable()
export class ReduxReducerProvider {

  private stateProviders: {
    [name: string]: ReduxStateProvider,
  } = {};

  public addStateProvider(provider: ReduxStateProvider) {
    if (!this.stateProviders[ provider.name ]) {
      ReduxRegistry.registerState(provider);
      this.stateProviders[ provider.name ] = provider;
    }
  }

  public reduce(rootState: ReduxRootState, action: ReduxActionWithPayload<any>): ReduxRootState {

    if (action.type === ReduxRegistry.ACTION_REGISTER_STATE) {
      const regAction = (action as {} as ReduxActionWithPayload<IRegisterStatePayload>);

      return {
        ...rootState,
        [ regAction.payload.name ]: regAction.payload.initialValue,
      };
    }

    return Object.values(this.stateProviders).reduce((stateToReduce, provider) => {
      return Object.assign({}, stateToReduce, {
        [ provider.name ]: provider.reduce(stateToReduce[ provider.name ], action),
      });
    }, rootState);
  }

}
