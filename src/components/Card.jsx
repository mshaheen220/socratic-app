import React from 'react';

const Card = ({ title, children, className = '', onClick }) => {
  return (
    <div className={`app-card ${className}`} onClick={onClick}>
      {title && <h3 className="app-card-title">{title}</h3>}
      {children}
    </div>
  );
};

export default Card;