// src/components/OrdersForm.jsx
import { useState, useEffect } from 'react';

const OrdersForm = ({ order, onSave, onCancel }) => {
  const [form, setForm] = useState({
    id: '',
    client_id: '',
    cake_id: '',
    quantity: 1,
    status_id: '',
    delivery_date: '',
    pickup_point_id: ''
  });

  const [clients, setClients] = useState([]);
  const [cakes, setCakes] = useState([]);
  const [pickupPoints, setPickupPoints] = useState([]);
  const [statuses, setStatuses] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const clientsRes = await window.api.getUsers();
        const cakesRes = await window.api.getGoods();
        const pointsRes = await window.api.getPickupPoints();
        const statusesRes = await window.api.getStatuses();

        setClients(clientsRes);
        setCakes(cakesRes);
        setPickupPoints(pointsRes);
        setStatuses(statusesRes);
      } catch (err) {
        console.error('Ошибка загрузки данных:', err);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (order) {
      setForm({
        id: order.id,
        client_id: order.client_id || '',
        cake_id: order.cake_id || '',
        quantity: order.quantity || 1,
        status_id: order.status_id || '',
        delivery_date: order.delivery_date || '',
        pickup_point_id: order.pickup_point_id || ''
      });
    }
  }, [order]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.client_id || !form.cake_id || !form.status_id || !form.delivery_date || !form.pickup_point_id) {
      alert('Заполните все обязательные поля');
      return;
    }
    onSave(form);
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>{form.id ? 'Редактировать заказ' : 'Добавить заказ'}</h2>
        <form onSubmit={handleSubmit}>
          <label>Клиент:</label>
          <select name="client_id" value={form.client_id} onChange={handleChange} required>
            <option value="">Выберите клиента</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>{c.fullname}</option>
            ))}
          </select>

          <label>Торт:</label>
          <select name="cake_id" value={form.cake_id} onChange={handleChange} required>
            <option value="">Выберите торт</option>
            {cakes.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <label>Количество:</label>
          <input type="number" name="quantity" value={form.quantity} onChange={handleChange} min="1" required />

          <label>Статус:</label>
          <select name="status_id" value={form.status_id} onChange={handleChange} required>
            <option value="">Выберите статус</option>
            {statuses.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>

          <label>Дата доставки:</label>
          <input type="date" name="delivery_date" value={form.delivery_date} onChange={handleChange} required />

          <label>Пункт выдачи:</label>
          <select name="pickup_point_id" value={form.pickup_point_id} onChange={handleChange} required>
            <option value="">Выберите пункт</option>
            {pickupPoints.map(p => (
              <option key={p.id} value={p.id}>{p.address}</option>
            ))}
          </select>

          <div className="modal-actions">
            <button type="button" onClick={onCancel} className="btn-cancel">Отмена</button>
            <button type="submit" className="btn-save">Сохранить</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrdersForm;
