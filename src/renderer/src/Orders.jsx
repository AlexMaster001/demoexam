// src/Orders.jsx
import { useEffect, useState, useMemo } from 'react';
import Dashboard from './Dashboard';
import OrdersForm from './components/OrdersForm';

function Orders({ user, showNotification }) {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filterStatus, setFilterStatus] = useState('all');
  const [editModal, setEditModal] = useState(null);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const result = await window.api.getOrders();
        setOrders(result);
      } catch (err) {
        console.error('❌ Ошибка загрузки заказов:', err);
        showNotification('Не удалось загрузить заказы', 'error');
      }
    };
    loadOrders();
  }, [showNotification]);

  const uniqueStatuses = useMemo(() => {
    return Array.from(new Set(orders.map(o => o.status).filter(Boolean)));
  }, [orders]);

  const filtered = useMemo(() => {
    let result = orders.filter(order =>
      Object.values(order).some(val =>
        String(val).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );

    if (filterStatus !== 'all') {
      result = result.filter(o => o.status === filterStatus);
    }

    return result.toSorted((a, b) => {
      const addrA = a.pickup_address?.toLowerCase() || '';
      const addrB = b.pickup_address?.toLowerCase() || '';
      return sortOrder === 'asc' ? addrA.localeCompare(addrB) : addrB.localeCompare(addrA);
    });
  }, [orders, searchTerm, filterStatus, sortOrder]);

  const handleAdd = () => setEditModal({});
  const handleEdit = (order) => setEditModal(order);

  const handleDelete = async (order) => {
    if (!window.confirm(`Удалить заказ №${order.order_number}?`)) return;
    try {
      await window.api.deleteOrder(order.id);
      const updated = await window.api.getOrders();
      setOrders(updated);
      showNotification('Заказ удалён', 'success');
    } catch (err) {
      showNotification('Ошибка удаления', 'error');
    }
  };

  const handleSave = async (formData) => {
    try {
      if (formData.id) {
        await window.api.updateOrder(formData);
        showNotification('Заказ обновлён', 'success');
      } else {
        await window.api.addOrder(formData);
        showNotification('Заказ добавлен', 'success');
      }
      const updated = await window.api.getOrders();
      setOrders(updated);
      setEditModal(null);
    } catch (err) {
      showNotification('Ошибка сохранения', 'error');
    }
  };

  return (
    <Dashboard user={user} setUser={() => {}}>
      <h2>Управление заказами</h2>

      <div className="filters">
        <input
          type="text"
          placeholder="Поиск по любым данным..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="all">Все статусы</option>
          {uniqueStatuses.map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="asc">Адрес ↑</option>
          <option value="desc">Адрес ↓</option>
        </select>
        {user.role === 'Администратор' && (
          <button onClick={handleAdd} className="btn-add">➕ Добавить заказ</button>
        )}
      </div>

      <div className="orders-list">
        {filtered.length === 0 ? (
          <p>Заказы не найдены</p>
        ) : (
          filtered.map(order => (
            <div key={order.id} className="order-card">
              <h3>Заказ №{order.order_number}</h3>
              <p><strong>Клиент:</strong> {order.client_name}</p>
              <p><strong>Торт:</strong> {order.cake_name}</p>
              <p><strong>Кол-во:</strong> {order.quantity}</p>
              <p><strong>Статус:</strong> {order.status}</p>
              <p><strong>Дата создания:</strong> {new Date(order.created_at).toLocaleString()}</p>
              <p><strong>Дата выдачи:</strong> {order.delivery_date ? new Date(order.delivery_date).toLocaleDateString() : '—'}</p>
              <p><strong>Пункт выдачи:</strong> {order.pickup_address}</p>
              <p><strong>Код:</strong> {order.code}</p>

              {user.role === 'Администратор' && (
                <div className="card-actions">
                  <button onClick={() => handleEdit(order)} className="btn-edit">✏️ Редактировать</button>
                  <button onClick={() => handleDelete(order)} className="btn-delete">🗑️ Удалить</button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {editModal && (
        <OrdersForm order={editModal} onSave={handleSave} onCancel={() => setEditModal(null)} />
      )}
    </Dashboard>
  );
}

export default Orders;
