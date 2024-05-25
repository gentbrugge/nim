import './App.css';
import Light from './components/Light';
import { BoardState, useBoard } from './store/Board';

function App() {
  const [board, controller] = useBoard();
  const lights: number[] = [];

  for (let i = board.maxHeight - 1; i >= 0; --i) {
    lights.push(i);
  }

  const player = board.player == 0 ? 'Player' : 'Computer';
  const showWinner = board.gameOver;
  const nextDisabled = board.activeColumn == null;

  return (
    <div className="App">
      <header className="App-header">
        {showWinner &&
        <>
          <span>Game Over</span>
          <span>The Winner Is</span>
        </>
        }
        <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
          <span>{player}</span>
          <div style={{display: 'flex', gap: '10px'}}>
            {
              board.columns.map((height, columnIndex) => {
                const removeDisabled = board.activeColumn != null && board.activeColumn != columnIndex;

                return (
                  <div key={columnIndex} style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                    {
                      lights.map((lightIndex) => {
                        const on = lightIndex < height;

                        return <Light key={lightIndex} on={on}></Light>
                      })
                    }
                    <button onClick={() => controller.remove(columnIndex)} style={{width: '8px', height: '14px', alignSelf: 'center', background: removeDisabled ? 'grey' : 'orange'}}/>
                  </div>
                )
              })
            }
          </div>
          <button onClick={() => showWinner ? controller.reset() : controller.computer(board)} style={{width: '8px', height: '14px', background: nextDisabled ? 'grey' : 'blue', alignSelf: 'center'}}/>
        </div>
      </header>
    </div>
  );
}

export default App;
