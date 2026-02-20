import { Routes, Route } from 'react-router-dom'

import ProtectedRoute from './components/ProtectedRoute'
import ProductList from './pages/ProductList'
import ProductDetail from './pages/ProductDetail'
import CartPage from './pages/CartPage'
import Checkout from './pages/Checkout'
import LoginPage from './pages/LoginPage'
import AdminDashboard from './pages/AdminDashboard'
import UserDashboard from './pages/UserDashboard'
import ProfilePage from './pages/ProfilePage'
import NotFoundPage from './pages/NotFoundPage'
import OrderSuccessPage from './pages/OrderSuccessPage'
import Layout from './components/Layout'
import AdminRoute from './components/AdminRoute'
import { useEffect } from 'react'
import './App.css'

function App() {
  // Apply theme early on all pages so it persists across Layout bounds (Login/404)
  useEffect(() => {
    const isDark = localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
    const root = window.document.documentElement
    if (isDark) root.classList.add('dark')
    else root.classList.remove('dark')
  }, [])

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<ProductList />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/admin" element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } />
        <Route path="/dashboard" element={
            <ProtectedRoute>
            <UserDashboard />
            </ProtectedRoute>
        } />
        <Route path="/profile" element={
            <ProtectedRoute>
            <ProfilePage />
            </ProtectedRoute>
        } />
      </Route>
      
      <Route path="/login" element={<LoginPage />} />
      <Route path="/order-success" element={<OrderSuccessPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App

