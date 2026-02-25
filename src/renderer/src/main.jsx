// src/main.jsx
import './assets/main.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom'; // ✅ Правильно: из 'react-router-dom'
import App from './App';

// Создаём корень
const root = createRoot(document.getElementById('root'));

// Рендерим приложение
root.render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>
);
