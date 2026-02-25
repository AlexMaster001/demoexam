// src/components/EditGoodForm.jsx
import { useState, useRef } from 'react';

const EditGoodForm = ({ good, onSave, onCancel }) => {
  const [form, setForm] = useState({
    id: good.id || '',
    article: good.article || '',
    name: good.name || '',
    type: good.type || '',
    category: good.category || '',
    description: good.description || '',
    supplier: good.supplier || '',
    manufacturer: good.manufacturer || '',
    price: good.price || '',
    measure: good.measure || 'шт',
    quantity: good.quantity || '',
    discount: good.discount || '',
    image_path: good.image_path || 'picture.png'
  });

  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const filename = `upload_${Date.now()}_${file.name}`;
      setForm(prev => ({ ...prev, image_path: filename }));

      // Здесь нужно сохранить файл в public/assets/
      // В экзамене можно пропустить — просто запомнить имя
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const price = parseFloat(form.price);
    const quantity = parseInt(form.quantity);
    const discount = parseFloat(form.discount) || 0;

    if (!form.article || !form.name || isNaN(price) || price < 0 || isNaN(quantity) || quantity < 0) {
      alert('Проверьте корректность данных!');
      return;
    }

    onSave({ ...form, price, quantity, discount });
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>{form.id ? 'Редактирование торта' : 'Добавление нового торта'}</h2>
        <form onSubmit={handleSubmit}>
          {!form.id && <p>ID будет присвоен автоматически</p>}
          {form.id && <p><strong>ID:</strong> {form.id}</p>}

          <label>Артикул:</label>
          <input name="article" value={form.article} onChange={handleChange} required />

          <label>Название:</label>
          <input name="name" value={form.name} onChange={handleChange} required />

          <label>Тип:</label>
          <select name="type" value={form.type} onChange={handleChange} required>
            <option value="">Выберите тип</option>
            <option value="Свадебный">Свадебный</option>
            <option value="Детский">Детский</option>
            <option value="Праздничный">Праздничный</option>
          </select>

          <label>Категория:</label>
          <input name="category" value={form.category} onChange={handleChange} />

          <label>Описание:</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows="3" />

          <label>Поставщик:</label>
          <input name="supplier" value={form.supplier} onChange={handleChange} required />

          <label>Производитель:</label>
          <input name="manufacturer" value={form.manufacturer} onChange={handleChange} required />

          <label>Цена:</label>
          <input name="price" type="number" step="0.01" value={form.price} onChange={handleChange} required min="0" />

          <label>Ед. изм.:</label>
          <input name="measure" value={form.measure} onChange={handleChange} />

          <label>Количество:</label>
          <input name="quantity" type="number" value={form.quantity} onChange={handleChange} required min="0" />

          <label>Скидка (%):</label>
          <input name="discount" type="number" step="0.01" value={form.discount} onChange={handleChange} min="0" max="100" />

          <label>Фото:</label>
          <input type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} />
          <p>Текущее фото: {form.image_path}</p>

          <div className="modal-actions">
            <button type="button" onClick={onCancel} className="btn-cancel">Отмена</button>
            <button type="submit" className="btn-save">Сохранить</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditGoodForm;
