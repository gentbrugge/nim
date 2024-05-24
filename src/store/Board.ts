import { useMemo, useReducer } from 'react';

interface State {
  maxHeight: number;
  columns: number[];
  activeColumn?: number;
  player: number;
  gameOver?: boolean;
}

interface Action {
  type: 'remove' | 'next' | 'reset';
  column?: number;
}

function getRandomColumns (columnCount: number, maxHeight: number) {
  let columns: number[] = [];
  for (let index = 0; index < columnCount; ++index) {
    columns[index] = Math.floor(Math.random() * (maxHeight + 1));
  }

  return columns;
}


function getInitialState(): State {
  return {
    maxHeight: 8,
    columns: getRandomColumns(4, 7),
    player: 0  
  }
};
function isGameOver (columns: number[]) {
  const count = columns.reduce((count, value) => count + value);
  if (count === 1) {
    return true;
  }

  return false;
}

function reduce(state: State, action: Action): State {
  switch (action.type) {
    case 'remove': {
      const { columns, activeColumn, gameOver } = state;
      const column = action.column!;

      if (gameOver) {
        return state;
      }

      if (activeColumn == null || activeColumn === column) {
        if (columns[column] == 0) {
          return state;
        }

        let newColumns = [...columns];
        newColumns[column] = newColumns[column] - 1;

        return {
          ...state,
          columns: newColumns,
          activeColumn: column,
          gameOver: isGameOver(newColumns)
        }
      }

      return state;
    }
    case 'next': {
      const { player, gameOver, activeColumn } = state;
      
      if (gameOver) {
        return state;
      }

      if (activeColumn == null) {
        return state;
      }

      return {
        ...state,
        activeColumn: undefined,
        player: (player + 1) % 2
      }
    }
    case 'reset': {
      const { columns, maxHeight } = state;

      return {
        ...state,
        columns: getRandomColumns(state.columns.length, maxHeight),
        gameOver: undefined,
        activeColumn: undefined
      };
    }
  }
}

class Controller {
  private dispatch: React.Dispatch<Action>;

  constructor (dispatch: React.Dispatch<Action>) {
    this.dispatch = dispatch;

    this.remove = this.remove.bind(this);
    this.next = this.next.bind(this);
  }

  public remove (column: number) {
    this.dispatch({
      type: 'remove',
      column: column
    });
  }

  public next () {
    this.dispatch({
      type: 'next'
    });
  }

  public reset () {
    this.dispatch({
      type: 'reset'
    });
  }
}

function useBoard (): [State, Controller] {
  const [board, dispatch] = useReducer(reduce, getInitialState());

  const controller = useMemo(() => {
    return new Controller(dispatch);
  }, []);

  return [board, controller];
}


export {
  type State as BoardState,
  useBoard
};