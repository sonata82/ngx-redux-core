import { Reducer, Store } from 'redux';
import { AsyncSubject } from 'rxjs/AsyncSubject';
import { getActionTypeByFunction } from './decorator/action';
import {
  ReduxReducerActionTypeArray,
} from './decorator/action/function';
import { ReduxStateInterface } from './decorator/state/interface';
import { IReduxAction } from './interfaces';
import { MetadataManager } from './metadata/manager';
import { ReduxReducerMetadata } from './decorator/reducer/metadata';
import { ReduxReducerActionType } from './decorator/action/function';

export class ReduxRegistryReducerItem {
  stateName: string;
  reducer: Reducer<{}>;
  type: ReduxReducerActionType<{}>;
}

export interface IRegisterModulePayload {
  initialState: {};
  stateName: string;
}

export class ReduxRegistry {

  public static readonly ACTION_REGISTER_MODULE = `${ReduxRegistry.name}://registerModule`;

  private static readonly _store = new AsyncSubject<Store<{}>>();
  private static readonly _reducers: ReduxRegistryReducerItem[] = [];

  public static registerStore(store: Store<{}>) {
    ReduxRegistry._store.next(store);
    ReduxRegistry._store.complete();
  }

  public static registerReducer(stateName: string, types: ReduxReducerActionTypeArray<{}>, reducer: Reducer<{}>) {

    if (Array.isArray(types)) {
      types.forEach((type) => {
        ReduxRegistry._reducers.push({
          reducer,
          stateName,
          type,
        });
      });
    } else {
      ReduxRegistry._reducers.push({
        reducer,
        stateName,
        type: types as ReduxReducerActionType<{}>,
      });
    }

  }

  public static registerState(state: ReduxStateInterface<{}>) {
    ReduxRegistry.getStore().then((store) => {

      const stateConfig = MetadataManager.getStateMetadata(state.constructor);

      Promise.resolve(state.getInitialState()).then((initialState) => {

        stateConfig.reducers
          .map((reducer) => MetadataManager.getReducerMetadata(reducer.constructor))
          .forEach((metadata: ReduxReducerMetadata) => {
            metadata.reducers.forEach(reducer => {
              ReduxRegistry.registerReducer(stateConfig.name, reducer.types, reducer.reducer);
            });
          });

        store.dispatch<IReduxAction<IRegisterModulePayload>>({
          payload: {
            initialState,
            stateName: stateConfig.name,
          },
          type: ReduxRegistry.ACTION_REGISTER_MODULE,
        });
      });

    });
  }

  public static getReducerItemsByType(type: string): ReduxRegistryReducerItem[] {
    return ReduxRegistry._reducers
      .filter(reducerItem => getActionTypeByFunction(reducerItem.type) === type);
  }

  public static getStore(): Promise<Store<{}>> {
    return new Promise(ReduxRegistry._store.subscribe.bind(ReduxRegistry._store));
  }

}
