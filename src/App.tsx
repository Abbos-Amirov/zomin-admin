import { BrowserRouter } from 'react-router-dom';
import AppRouter from './app/router';
import './css/index.css';

function App() {
  return (
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  );
}

export default App;
