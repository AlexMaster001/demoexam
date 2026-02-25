// src/Store.jsx
import { useEffect, useState, useMemo } from "react";
import Dashboard from "./Dashboard";
import GoodsCard from "./components/GoodsCard";
import EditGoodForm from "./components/EditGoodForm";

function Store({ user, setUser, showNotification }) {
  const [goods, setGoods] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filterSupplier, setFilterSupplier] = useState('all');
  const [editModal, setEditModal] = useState(null);

  // Загрузка товаров
  useEffect(() => {
    const loadData = async () => {
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
      loadData();
    }
  }, [user, showNotification]);

  const uniqueSuppliers = useMemo(() => {
    return Array.from(new Set(goods.map(g => g.supplier).filter(Boolean)));
  }, [goods]);

  const filtered = useMemo(() => {
    let result = goods.filter(g =>
      g.article?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.supplier?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filterSupplier !== 'all') {
      result = result.filter(g => g.supplier === filterSupplier);
    }

    return sortOrder === 'asc'
      ? result.toSorted((a, b) => a.quantity - b.quantity)
      : result.toSorted((a, b) => b.quantity - a.quantity);
  }, [goods, searchTerm, filterSupplier, sortOrder]);

  // --- CRUD ---

  const handleAdd = () => {
    if (editModal !== null) {
      showNotification('Нельзя открыть две формы одновременно', 'warning');
      return;
    }
    setEditModal({});
  };

  const handleEdit = (good) => {
    if (editModal !== null) {
      showNotification('Нельзя открыть две формы одновременно', 'warning');
      return;
    }
    setEditModal(good);
  };

  const handleDelete = async (good) => {
    if (!window.confirm(`Удалить торт "${good.name}"?`)) return;

    try {
      const result = await window.api.deleteGood(good.id);
      if (result.success) {
        const updated = await window.api.getGoods();
        const processed = updated.map(g => ({
          ...g,
          price: parseFloat(g.price) || 0,
          quantity: parseInt(g.quantity) || 0,
          discount: parseFloat(g.discount) || 0
        }));
        setGoods(processed);
        showNotification('Торт удалён', 'success');
      } else {
        showNotification(result.message || 'Нельзя удалить торт', 'error');
      }
    } catch (err) {
      showNotification('Ошибка удаления', 'error');
    }
  };

  const handleSave = async (formData) => {
    try {
      if (formData.id) {
        await window.api.updateGood(formData);
        showNotification('Торт обновлён', 'success');
      } else {
        await window.api.addGood(formData);
        showNotification('Торт добавлен', 'success');
      }
      const updated = await window.api.getGoods();
      const processed = updated.map(g => ({
        ...g,
        price: parseFloat(g.price) || 0,
        quantity: parseInt(g.quantity) || 0,
        discount: parseFloat(g.discount) || 0
      }));
      setGoods(processed);
      setEditModal(null);
    } catch (err) {
      showNotification(err.message || 'Ошибка сохранения', 'error');
    }
  };

  const closeModal = () => setEditModal(null);

  return (
    <Dashboard user={user} setUser={setUser}>
      {/* Кнопка "Добавить" только для админа */}
      {user.role === 'Администратор' && (
        <div style={{ padding: '0 10px 10px' }}>
          <button onClick={handleAdd} className="btn-add">➕ Добавить торт</button>
        </div>
      )}

      {/* Поиск и фильтры */}
      <div className="filters">
        <input
          type="text"
          placeholder="Поиск по артикулу, названию, поставщику..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select value={filterSupplier} onChange={(e) => setFilterSupplier(e.target.value)}>
          <option value="all">Все поставщики</option>
          {uniqueSuppliers.map(name => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="asc">Кол-во ↑</option>
          <option value="desc">Кол-во ↓</option>
        </select>
      </div>

      {/* Список тортов */}
      <div className="goodsContainer">
        {filtered.length === 0 ? (
          <p>Торты не найдены</p>
        ) : (
          filtered.map(g => (
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

      {/* Форма добавления/редактирования */}
      {editModal && <EditGoodForm good={editModal} onSave={handleSave} onCancel={closeModal} />}
    </Dashboard>
  );
}

export default Store;
