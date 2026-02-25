// src/components/GoodsCard.jsx
import { memo } from 'react';

const GoodsCard = ({ good }) => {
  const discount = parseFloat(good.discount) || 0;
  const price = parseFloat(good.price) || 0;
  const discountPrice = discount > 0 ? price * (1 - discount / 100) : null;

  const photoSrc = `src/assets/${good.image_path || 'picture.png'}`;

  const cardClass = [
    'goodsCard',
    good.quantity === 0 ? 'out-of-stock' : '',
    discount > 15 ? 'high-discount' : ''
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClass}>
      <div className="goodsPhoto">
        <img
          src={photoSrc}
          alt={good.name}
          onError={(e) => { e.target.src = 'src/assets/picture.png'; }}
        />
      </div>
      <div className="goodsInfo">
        <div className="goodsHeading">{`${good.category} | ${good.type}`}</div>
        <p><strong>Артикул:</strong> {good.article}</p>
        <p><strong>Название:</strong> {good.name}</p>
        <p><strong>Описание:</strong> {good.description || '—'}</p>
        <p><strong>Поставщик:</strong> {good.supplier}</p>
        <p><strong>Производитель:</strong> {good.manufacturer}</p>
        <p><strong>Ед. изм.:</strong> {good.measure}</p>
        <div className="price-block">
          {discountPrice ? (
            <>
              <span className="old-price">₽{price.toFixed(2)}</span>
              <span className="current-price">₽{discountPrice.toFixed(2)}</span>
            </>
          ) : (
            <span className="current-price">₽{price.toFixed(2)}</span>
          )}
        </div>
        <p><strong>На складе:</strong> {good.quantity} шт.</p>
      </div>
      <div className="goodsDiscount">
        {discount > 0 ? <h3>{Math.round(discount)}%</h3> : <h3>—</h3>}
      </div>
    </div>
  );
};

export default memo(GoodsCard);
