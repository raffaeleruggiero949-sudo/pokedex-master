import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import CardDetail from './pages/CardDetail';
// 1. Importiamo la nuova pagina
import Login from './pages/Login'; 

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/card/:id" element={<CardDetail />} />
        {/* 2. Aggiungiamo la rotta per il login */}
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;