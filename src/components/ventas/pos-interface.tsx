'use client';

import { useState, useEffect } from 'react';
import { Producto } from '@prisma/client';
import { createVenta } from '@/actions/ventas-actions';
import { MagnifyingGlassIcon, TrashIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/outline';

type SerializedProducto = Omit<Producto, 'precio'> & { precio: number };

interface CartItem {
  producto: SerializedProducto;
  cantidad: number;
}

export default function PosInterface({ initialProductos }: { initialProductos: SerializedProducto[] }) {
  const [productos, setProductos] = useState<SerializedProducto[]>(initialProductos);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [metodoPago, setMetodoPago] = useState<'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA'>('EFECTIVO');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Filter products based on search
  const filteredProductos = productos.filter((p) =>
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.codigo && p.codigo.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const addToCart = (producto: SerializedProducto) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.producto.id === producto.id);
      if (existing) {
        // Check stock
        if (existing.cantidad + 1 > producto.stock) {
            alert('No hay suficiente stock');
            return prev;
        }
        return prev.map((item) =>
          item.producto.id === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }
      if (producto.stock < 1) {
          alert('No hay stock disponible');
          return prev;
      }
      return [...prev, { producto, cantidad: 1 }];
    });
  };

  const removeFromCart = (productoId: string) => {
    setCart((prev) => prev.filter((item) => item.producto.id !== productoId));
  };

  const updateQuantity = (productoId: string, delta: number) => {
    setCart((prev) => {
      return prev.map((item) => {
        if (item.producto.id === productoId) {
          const newQuantity = item.cantidad + delta;
          if (newQuantity < 1) return item;
          if (newQuantity > item.producto.stock) {
              alert('No hay suficiente stock');
              return item;
          }
          return { ...item, cantidad: newQuantity };
        }
        return item;
      });
    });
  };

  const total = cart.reduce((acc, item) => acc + Number(item.producto.precio) * item.cantidad, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);
    setMessage(null);

    const result = await createVenta({
      items: cart.map((item) => ({
        productoId: item.producto.id,
        cantidad: item.cantidad,
        precioUnitario: Number(item.producto.precio),
      })),
      metodoPago,
      socioId: null, // TODO: Implement socio selection
    });

    setIsSubmitting(false);
    if (result.success) {
      setMessage({ type: 'success', text: result.message || 'Venta realizada' });
      setCart([]);
      // Optionally refresh products to update stock locally or rely on revalidatePath
      // Since revalidatePath happens on server, we might want to update local state if we don't reload
      // For now, let's just clear cart. Ideally we should refetch products.
    } else {
      setMessage({ type: 'error', text: result.message || 'Error al procesar venta' });
    }
  };

  return (
    <div className="flex h-full flex-col gap-4 md:flex-row">
      {/* Product Selection Area */}
      <div className="flex flex-1 flex-col gap-4 rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar productos..."
            className="w-full rounded-md border border-gray-200 py-2 pl-10 pr-4 outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid flex-1 grid-cols-2 gap-4 overflow-y-auto sm:grid-cols-3 lg:grid-cols-4">
          {filteredProductos.map((producto) => (
            <button
              key={producto.id}
              onClick={() => addToCart(producto)}
              disabled={!producto.activo || producto.stock <= 0}
              className={`flex flex-col justify-between rounded-lg border p-3 text-left transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700 ${
                (!producto.activo || producto.stock <= 0) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">{producto.nombre}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Stock: {producto.stock}</p>
              </div>
              <p className="mt-2 font-bold text-blue-600 dark:text-blue-400">
                ${Number(producto.precio).toFixed(2)}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Cart / Checkout Area */}
      <div className="flex w-full flex-col rounded-lg bg-white p-4 shadow md:w-96 dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">Carrito de Venta</h2>
        
        <div className="flex-1 overflow-y-auto">
          {cart.length === 0 ? (
            <p className="text-center text-gray-500">El carrito está vacío</p>
          ) : (
            <div className="flex flex-col gap-3">
              {cart.map((item) => (
                <div key={item.producto.id} className="flex items-center justify-between border-b pb-2 dark:border-gray-700">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">{item.producto.nombre}</p>
                    <p className="text-sm text-gray-500">
                      ${Number(item.producto.precio).toFixed(2)} x {item.cantidad}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.producto.id, -1)}
                      className="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <MinusIcon className="h-4 w-4" />
                    </button>
                    <span className="w-4 text-center">{item.cantidad}</span>
                    <button
                      onClick={() => updateQuantity(item.producto.id, 1)}
                      className="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <PlusIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => removeFromCart(item.producto.id)}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 border-t pt-4 dark:border-gray-700">
          <div className="mb-4 flex justify-between text-xl font-bold text-gray-900 dark:text-white">
            <span>Total:</span>
            <span>${total.toFixed(2)}</span>
          </div>

          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
              Método de Pago
            </label>
            <select
              value={metodoPago}
              onChange={(e) => setMetodoPago(e.target.value as any)}
              className="w-full rounded-md border border-gray-200 p-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            >
              <option value="EFECTIVO">Efectivo</option>
              <option value="TARJETA">Tarjeta</option>
              <option value="TRANSFERENCIA">Transferencia</option>
            </select>
          </div>

          {message && (
            <div className={`mb-4 rounded p-2 text-sm ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {message.text}
            </div>
          )}

          <button
            onClick={handleCheckout}
            disabled={cart.length === 0 || isSubmitting}
            className="w-full rounded-lg bg-blue-600 py-3 font-bold text-white transition-colors hover:bg-blue-500 disabled:opacity-50"
          >
            {isSubmitting ? 'Procesando...' : 'Confirmar Venta'}
          </button>
        </div>
      </div>
    </div>
  );
}
