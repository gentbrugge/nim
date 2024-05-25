import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import NimPage from './components/NimPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/nim" element={<NimPage/>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
