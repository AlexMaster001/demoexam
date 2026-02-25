// src/components/GoodsCard.jsx
function GoodsCard({ good }) {
  const finalPrice = Math.round(good.price * (1 - good.discount / 100));

  // Фон строки
  const bgColor = good.quantity <= 0
    ? '#ccc'
    : good.discount > 15
      ? '#483D8B'  // цвет по заданию!
      : 'white';

  return (
    <div className="card-wrapper" style={{ backgroundColor: bgColor }}>
      <div className="goodsPhoto">
        <img
          src={`src/assets/${good.image_path || 'picture.png'}`}
          alt={good.name}
          onError={(e) => e.target.src = 'src/assets/picture.png'}
        />
      </div>
      <div className="goodsCard">
        <h3>{good.name}</h3>
        <p><strong>Категория:</strong> {good.category}</p>
        <p><strong>Производитель:</strong> {good.manufacturer}</p>
        <p><strong>Поставщик:</strong> {good.supplier}</p>
        <p><strong>Описание:</strong> {good.description}</p>
        <p><strong>Единица:</strong> {good.unit}</p>
        <p><strong>На складе:</strong> {good.quantity} шт.</p>
        
        <div className="price-block">
          <span className="old-price">{good.price} ₽</span>
          <span className="current-price">{finalPrice} ₽</span>
        </div>
      </div>
    </div>
  );
}

export default GoodsCard;
