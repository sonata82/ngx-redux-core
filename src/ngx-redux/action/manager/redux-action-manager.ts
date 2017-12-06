import { MetadataManager } from '../../metadata/manager';
import { Registry } from '../../registry';
import { ActionFunctionType } from '../function-type';

export class ReduxActionManager {

  public static getType(target: ActionFunctionType<{}>) {
    const {type, contextClazz} = MetadataManager.getActionMetadata(target);
    const {prefix} = MetadataManager.getActionContextMetadata(contextClazz);
    return `${prefix}${type}`;
  }

  public static dispatch<P = {}>(target: ActionFunctionType<{}>, payload?: P | Promise<P>): Promise<void> {
    return Promise.all([
      Promise.resolve<P>(payload),
      Registry.getStore(),
    ]).then(([ p, store ]) => {
      store.dispatch({
        payload: p,
        type: ReduxActionManager.getType(target)
      });
    });
  }

  public static createProxy<P>(descriptor: TypedPropertyDescriptor<ActionFunctionType<P>>): ActionFunctionType<P> {
    const originalFunction = descriptor.value;

    return function () {
      const returnValue = originalFunction.apply(this, arguments);
      ReduxActionManager.dispatch(descriptor.value, returnValue);
      return returnValue;
    };
  }

}