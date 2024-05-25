import { useMemo, useReducer } from 'react';
import { useSearchParams } from 'react-router-dom';

interface State {
  rows: number;
  columnValues: number[];
  activeColumn?: number;
  player: number;
  gameOver?: boolean;
}

interface Action {
  type: 'remove' | 'next' | 'reset' | 'highlight';
  column?: number;
}

function getBestMove (columns: number[]): [number, number] {
  const freeMoves = columns.reduce((result, value) => {
    if (value > 1) {
      return result + 1;
    }
    return result;
  }, 0);

  if (freeMoves < 2) {
    const nonEmptyColumns = columns.reduce((result, value) => {
      if (value > 0) {
        return result + 1;
      }
      return result;
    }, 0);

    let max = columns.reduce((max, value) => {
      return Math.max(max, value);
    });

    const columnIndex = columns.findIndex((value) => value === max);

    if (nonEmptyColumns % 2 === 0) {
      // take all
      return [columnIndex, columns[columnIndex]];
    } else {
      // leave one
      return [columnIndex, columns[columnIndex] - 1];
    }
  }

  const nimSum = columns.reduce((nimSum, value) => nimSum ^ value);

  let columnIndex = columns.findIndex((value) => {
    return (value ^ nimSum) < value;
  });

  let take = 0;
  if (columnIndex !== -1) {
    take = columns[columnIndex] - (columns[columnIndex] ^ nimSum);
  }

  if (take === 0) {
    columnIndex = columns.findIndex((value) => value > 0);
    take = 1;
  }

  return [columnIndex, take];
}

function getRandomColumns (columnCount: number, maxHeight: number) {
  let columns: number[] = [];
  for (let index = 0; index < columnCount; ++index) {
    columns[index] = Math.floor(Math.random() * (maxHeight)) + 1;
  }

  columns.sort();
  
  return columns;
}

function getInitialState(rows: number, columns: number, maxHeight: number, initialBoard: string | null): State {
  let defaultBoard: number[] | null = null;
  let minRows = rows;
  if (initialBoard != null) {
    const parts = initialBoard.split(' ');

    let board: number[] = [];
    try {
      for (const part of parts) {
        const value = Number.parseInt(part);
        board.push(value);

        minRows = Math.max(value, minRows);
      }
    }
    catch (reason) {
      // ignore
    }

    defaultBoard = board;
  }

  return {
    rows: minRows,
    columnValues: defaultBoard != null ? defaultBoard : getRandomColumns(columns, maxHeight),
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
      const { columnValues: columns, activeColumn, gameOver } = state;
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
          columnValues: newColumns,
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
      const { columnValues: columns, rows: maxHeight } = state;

      return {
        ...state,
        columnValues: getRandomColumns(state.columnValues.length, maxHeight),
        gameOver: undefined,
        activeColumn: undefined
      };
    }
    case 'highlight': {
      const column = action.column;
      return {
        ...state,
        activeColumn: column
      }
    }
  }
}

async function sleep(ms: number) {
  const promise = new Promise((resolve) => {
    const timeout = setTimeout(() => {resolve(null)}, ms);

  });

  return promise;
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

  public async computer (board: State) {
    const [columnIndex, take] = getBestMove(board.columnValues);

    this.next();

    for (let index = 0; index < (board.columnValues.length * 2 + columnIndex); ++index) {
      let highlight = index % (2 * board.columnValues.length);
      if (highlight >= board.columnValues.length) {
        highlight = 2 * board.columnValues.length - highlight - 1;
      }
      this.dispatch({
        type: 'highlight',
        column: highlight
      });
      await sleep(50);
    }

    this.dispatch({
      type: 'highlight',
      column: columnIndex
    });

    await sleep(1500);

    for (let index = 0; index < take; ++index) {
      this.remove(columnIndex);
      await sleep(600);
    }
    this.next();
  }

  public reset () {
    this.dispatch({
      type: 'reset'
    });
  }
}

function parseInt(value: string | null, defaultValue: number): number {
  if (value == null) {
    return defaultValue;
  }

  try {
    const val = Number.parseInt(value);
    return val;
  }
  catch (reason) {
    // ignore
  }

  return defaultValue;
}

function useBoard (): [State, Controller] {
  const [searchParams] = useSearchParams();
  const rows = parseInt(searchParams.get('rows'), 7);
  const columns = parseInt(searchParams.get('columns'), 4);
  const maxHeight = Math.min(rows, parseInt(searchParams.get('maxheight'), rows));
  const intitialBoard = searchParams.get('board');

  const [board, dispatch] = useReducer(reduce, getInitialState(rows, columns, maxHeight, intitialBoard));

  const controller = useMemo(() => {
    return new Controller(dispatch);
  }, []);

  return [board, controller];
}


export {
  type State as BoardState,
  useBoard
};