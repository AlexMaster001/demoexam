// src/App.jsx
import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import LoginForm from "./LoginForm";
import Store from "./Store";
import Orders from "./Orders"; // ✅ Добавлен импорт

function App() {
  const [user, setUser] = useState({ role: 'гость', name: null });
  const [notification, setNotification] = useState(null);

  const showNotification = (text, type = 'info') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <>
      {/* 🔹 Исправлен путь к логотипу */}
      <img className="logo" src="src/assets/icon.JPG" alt="иконка" />

      {user.name ? <h1>{`${user.name} | Роль: ${user.role}`}</h1> : <h1>Гость</h1>}
      
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.text}
        </div>
      )}

      <Routes>
        {/* Главная — форма входа */}
        <Route 
          path='/' 
          element={<LoginForm setUser={setUser} showNotification={showNotification} />} 
        />

        {/* Страница с товарами */}
        <Route 
          path='/main' 
          element={<Store user={user} setUser={setUser} showNotification={showNotification} />} 
        />

        {/* 🔹 Страница заказов */}
        <Route 
          path='/orders' 
          element={<Orders user={user} showNotification={showNotification} />} 
        />

        {/* Редирект по умолчанию */}
        <Route path="*" element={<LoginForm setUser={setUser} showNotification={showNotification} />} />
      </Routes>
    </>
  );
}

export default App;
