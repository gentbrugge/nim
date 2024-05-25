import { useSearchParams } from 'react-router-dom';
import { useBoard } from '../store/Board';
import Light from './Light';

function NimPage () {
  const [board, controller] = useBoard();
  const [searchParams] = useSearchParams();
  
  const rowIndices: number[] = [];
  for (let i = board.rows - 1; i >= 0; --i) {
    rowIndices.push(i);
  }

  const computer = searchParams.get('computer');
  const player1 = searchParams.get('player1') ?? 'Player 1';
  const player2 = computer ?? searchParams.get('player2') ?? 'Player 2'; 

  const playerName = board.player == 0 ? player1 : player2;
  const showWinner = board.gameOver;
  const nextDisabled = board.activeColumn == null || board.computerMove;
  
  const handleNext = () => {
    if (board.computerMove) {
      return;
    }

    if (board.activeColumn == null) {
      return;
    }

    if (computer) {
      controller.computer(board);
    } else {
      controller.next();
    }
  } 

   return (
    <div className="App">
      <header className="App-header">
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', gap: '10px'}}>
          <span>{playerName}</span>
          <div style={{display: 'flex', gap: '10px'}}>
            {
              board.columnValues.map((rowValue, columnIndex) => {
                const removeDisabled = board.activeColumn != null && board.activeColumn != columnIndex;

                return (
                  <div key={columnIndex} style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                    {
                      rowIndices.map((rowIndex) => {
                        const on = rowIndex < rowValue;

                        return <Light key={rowIndex} on={on}></Light>
                      })
                    }
                    <button onClick={() => board.computerMove ? undefined : controller.remove(columnIndex)} style={{width: '8px', height: '14px', alignSelf: 'center', background: removeDisabled ? 'grey' : 'orange'}}/>
                  </div>
                )
              })
            }
          </div>
          <button onClick={handleNext} style={{width: '8px', height: '14px', background: nextDisabled ? 'grey' : 'blue'}}/>
        </div>
        {showWinner &&
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: '#55000055',
            backdropFilter: 'blur(5px)'
          }}
        >
          <h1>Game Over</h1>
          <span>The Winner Is</span>
          <h2>{playerName}</h2>
          <button onClick={controller.reset}>Play Again</button>
        </div>
        }
      </header>
    </div>
   );
  }

export default NimPage;