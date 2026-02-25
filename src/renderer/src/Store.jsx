// src/Store.jsx
import { useEffect, useState, useMemo } from "react";
import Dashboard from "./Dashboard";
import GoodsCard from "./components/GoodsCard";
import EditGoodForm from "./components/EditGoodForm";

function Store({ user, setUser, showNotification }) {
  const [goods, setGoods] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filterDiscount, setFilterDiscount] = useState('all');
  const [editModal, setEditModal] = useState(null);

  useEffect(() => {
    const loadGoods = async () => {
      try {
        const result = await window.api.getGoods();
        const processed = result.map(g => ({
          ...g,
          price: parseFloat(g.price) || 0,
          quantity: parseInt(g.quantity) || 0,
          discount: parseFloat(g.discount) || 0
        }));
        setGoods(processed);
      } catch (err) {
        showNotification('Ошибка загрузки товаров', 'error');
      }
    };

    if (user?.role && user.role !== 'не авторизован') {
      loadGoods();
    }
  }, [user, showNotification]);

  // Диапазоны фильтрации скидок
  const filteredByDiscount = useMemo(() => {
    let result = [...goods];
    if (filterDiscount === '0-11.99') {
      result = result.filter(g => g.discount >= 0 && g.discount < 12);
    } else if (filterDiscount === '12-18.99') {
      result = result.filter(g => g.discount >= 12 && g.discount < 19);
    } else if (filterDiscount === '19+') {
      result = result.filter(g => g.discount >= 19);
    }
    return result;
  }, [goods, filterDiscount]);

  const sorted = useMemo(() => {
    return sortOrder === 'asc'
      ? filteredByDiscount.toSorted((a, b) => a.price - b.price)
      : filteredByDiscount.toSorted((a, b) => b.price - a.price);
  }, [filteredByDiscount, sortOrder]);

  const searched = useMemo(() => {
    return sorted.filter(g =>
      Object.values(g).some(val =>
        String(val).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [sorted, searchTerm]);

  const handleAdd = () => {
    if (editModal !== null) {
      showNotification('Форма уже открыта', 'warning');
      return;
    }
    setEditModal({});
  };

  const handleEdit = (good) => {
    if (editModal !== null) {
      showNotification('Форма уже открыта', 'warning');
      return;
    }
    setEditModal(good);
  };

  const handleDelete = async (good) => {
    if (!window.confirm(`Удалить "${good.name}"?`)) return;

    try {
      const result = await window.api.deleteGood(good.id);
      if (result.success) {
        const updated = await window.api.getGoods();
        setGoods(updated);
        showNotification('Товар удалён', 'success');
      } else {
        showNotification(result.message, 'error');
      }
    } catch (err) {
      showNotification('Ошибка удаления', 'error');
    }
  };

  const handleSave = async (formData) => {
    try {
      if (formData.id) {
        await window.api.updateGood(formData);
        showNotification('Товар обновлён', 'success');
      } else {
        await window.api.addGood(formData);
        showNotification('Товар добавлен', 'success');
      }
      const updated = await window.api.getGoods();
      setGoods(updated);
      setEditModal(null);
    } catch (err) {
      showNotification('Ошибка сохранения', 'error');
    }
  };

  return (
    <Dashboard user={user} setUser={setUser}>
      {user.role === 'Администратор' && (
        <div style={{ padding: '0 10px 10px' }}>
          <button onClick={handleAdd} className="btn-add">➕ Добавить велосипед</button>
        </div>
      )}

      <div className="filters">
        <input
          type="text"
          placeholder="Поиск..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select value={filterDiscount} onChange={(e) => setFilterDiscount(e.target.value)}>
          <option value="all">Все диапазоны</option>
          <option value="0-11.99">0–11,99%</option>
          <option value="12-18.99">12–18,99%</option>
          <option value="19+">19% и более</option>
        </select>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="asc">Цена ↑</option>
          <option value="desc">Цена ↓</option>
        </select>
      </div>

      <div className="goodsContainer">
        {searched.length === 0 ? (
          <p>Велосипеды не найдены</p>
        ) : (
          searched.map(g => (
            <div key={g.id} className="card-wrapper">
              <GoodsCard good={g} />
              {user.role === 'Администратор' && (
                <div className="card-actions">
                  <button onClick={() => handleEdit(g)} className="btn-edit">✏️ Редактировать</button>
                  <button onClick={() => handleDelete(g)} className="btn-delete">🗑️ Удалить</button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {editModal && (
        <EditGoodForm good={editModal} onSave={handleSave} onCancel={() => setEditModal(null)} />
      )}
    </Dashboard>
  );
}

export default Store;
