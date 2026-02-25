// src/Dashboard.jsx
import { useNavigate } from "react-router-dom";

function Dashboard({ user, setUser, children }) {
  const navigate = useNavigate();

  const logout = () => {
    setUser({});
    navigate('/');
  };

  return (
    <div className="dashboard">
      <div className="header-controls">
        <button onClick={logout} className="btn-logout">Выход</button>

        {/* Просмотр товаров */}
        {(user.role === 'Авторизованный клиент' || 
          user.role === 'Менеджер' || 
          user.role === 'Администратор') && (
          <button onClick={() => navigate('/main')} className="btn-add">📦 Товары</button>
        )}

        {/* Кнопка "Заказы" — только для Менеджера и Администратора */}
        {(user.role === 'Менеджер' || user.role === 'Администратор') && (
          <button onClick={() => navigate('/orders')} className="btn-orders">📋 Заказы</button>
        )}
      </div>

      <div className="content">
        {children}
      </div>
    </div>
  );
}

export default Dashboard;
