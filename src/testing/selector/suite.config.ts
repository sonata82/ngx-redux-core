import { MetadataManager } from '../../metadata/manager';
import { TestingState } from '../testing.state';

export interface SelectorTestCase {
  given: {
    name: string;
    path: string;
  };
  result: {
    initialState: {};
  };
}

export function selectorSuiteFactory(): SelectorTestCase[] {

  const state = TestingState.INITIAL_STATE;
  const rootState = {
    [MetadataManager.getStateMetadata(TestingState).name]: state,
  };

  return [ {
    given: {
      name: 'unknown',
      path: 'unknown',
    },
    result: {
      initialState: null,
    },
  },{
    given: {
      name: 'empty',
      path: '',
    },
    result: {
      initialState: state,
    },
  }, {
    given: {
      name: 'todo',
      path: 'todo',
    },
    result: {
      initialState: state.todo,
    },
  }, {
    given: {
      name: 'todoItems',
      path: 'todo/items',
    },
    result: {
      initialState: state.todo.items,
    },
  }, {
    given: {
      name: 'todoItemsTrailingSlash',
      path: 'todo/items/',
    },
    result: {
      initialState: state.todo.items,
    },
  }, {
    given: {
      name: 'root',
      path: '/',
    },
    result: {
      initialState: rootState,
    },
  } ];
}
