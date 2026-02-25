// src/LoginForm.jsx
import { useNavigate } from "react-router-dom";

function LoginForm({ setUser, showNotification }) {
  const navigate = useNavigate();

  async function submitHandler(e) {
    e.preventDefault();
    const user = {
      login: e.target.login.value,
      password: e.target.password.value,
    };
    try {
      const { role, fullname } = await window.api.authorizeUser(user);
      setUser({ role, name: fullname });
      navigate('/main');
    } catch (err) {
      showNotification('Ошибка авторизации', 'error');
    }
  }

  return (
    <>
      <img className="logo" src="/assets/icon.JPG" alt="иконка" />
      <h1>Кондитерская «Сладкий рай»</h1>
      <form onSubmit={submitHandler}>
        <label htmlFor="login">Логин:</label>
        <input id="login" type="text" required />
        <label htmlFor="password">Пароль:</label>
        <input id="password" type="password" required />
        <button type="submit">Войти</button>
      </form>
      <button onClick={() => {
        setUser({ role: 'гость', name: null });
        navigate('/main');
      }}>Просмотреть каталог (режим гостя)</button>
    </>
  );
}

export default LoginForm;
