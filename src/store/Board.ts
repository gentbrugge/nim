import { useMemo, useReducer } from 'react';
import { useSearchParams } from 'react-router-dom';

interface State {
  rows: number;
  columnValues: number[];
  activeColumn?: number;
  player: number;
  computerMove?: boolean;
  gameOver?: boolean;
}

interface Action {
  type: 'remove' | 'next' | 'reset' | 'highlight' | 'computer';
  column?: number;
  state?: State;
}

function getNimSum (columns: number[]) {
  const nimSum = columns.reduce((nimSum, value) => nimSum ^ value);
  return nimSum;
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

  const nimSum = getNimSum(columns);

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

  // Make sure the random board can be won by the first player.
  if (getNimSum(columns) === 0) {
    columns[columns.length - 1] -= 1;

    columns.sort();
  }

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
        player: (player + 1) % 2,
        computerMove: false
      }
    }
    case 'reset': {
      const { state } = action;

      return state!;
    }
    case 'highlight': {
      const column = action.column;
      return {
        ...state,
        activeColumn: column
      }
    }
    case 'computer': {
      return {
        ...state,
        computerMove: true
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
  private initialState: State;

  constructor (dispatch: React.Dispatch<Action>, initialState: State) {
    this.dispatch = dispatch;
    this.initialState = initialState;

    this.remove = this.remove.bind(this);
    this.next = this.next.bind(this);
    this.reset = this.reset.bind(this);
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

    this.dispatch({
      type: 'computer'
    });

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
      type: 'reset',
      state: this.initialState
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

  const initialState = getInitialState(rows, columns, maxHeight, intitialBoard);
  const [board, dispatch] = useReducer(reduce, initialState);

  const controller = useMemo(() => {
    return new Controller(dispatch, initialState);
  }, []);

  return [board, controller];
}


export {
  type State as BoardState,
  useBoard
};