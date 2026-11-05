import { Route, Routes } from 'react-router-dom';
import StoreLayout from './components/layout/StoreLayout.jsx';
import AdminLayout from './components/layout/AdminLayout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AdminRoute from './components/AdminRoute.jsx';
import Home from './pages/Home.jsx';
import Shop from './pages/Shop.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import Cart from './pages/Cart.jsx';
import Checkout from './pages/Checkout.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Orders from './pages/Orders.jsx';
import OrderDetail from './pages/OrderDetail.jsx';
import Profile from './pages/Profile.jsx';
import NotFound from './pages/NotFound.jsx';
import Dashboard from './pages/admin/Dashboard.jsx';
import AdminProducts from './pages/admin/Products.jsx';
import ProductForm from './pages/admin/ProductForm.jsx';
import AdminOrders from './pages/admin/Orders.jsx';
import AdminOrderDetail from './pages/admin/OrderDetail.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<StoreLayout />}>
        <Route index element={<Home />} />
        <Route path="shop" element={<Shop />} />
        <Route path="product/:id" element={<ProductDetail />} />
        <Route path="cart" element={<Cart />} />

        <Route element={<ProtectedRoute />}>
          <Route path="checkout" element={<Checkout />} />
          <Route path="orders" element={<Orders />} />
          <Route path="orders/:id" element={<OrderDetail />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="products/new" element={<ProductForm />} />
          <Route path="products/:id/edit" element={<ProductForm />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="orders/:id" element={<AdminOrderDetail />} />
        </Route>
      </Route>
    </Routes>
  );
}
