import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ChosenProduct from './ChosenProduct';
import Products from './Products';
import '../../css/products.css';

export default function MenuPage() {
  return (
    <div className="products-page">
      <Routes>
        {/* /products */}
        <Route index element={<Products />} />
        {/* /products/:productId */}
        <Route path=":productId" element={<ChosenProduct />} />
      </Routes>
    </div>
  );
}
