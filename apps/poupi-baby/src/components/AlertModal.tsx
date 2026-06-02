'use client';

import { useState } from 'react';
import { track } from '@vercel/analytics';

type Props = {
  productId: string;
  productTitle: string;
  currentPrice: number;
  onClose: () => void;
  onCreated: () => void;
};

export function AlertModal({ productId, productTitle, currentPrice, onClose, onCreated }: Props) {
  const [targetPrice, setTargetPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    const price = Number(targetPrice.replace(',', '.'));

    if (isNaN(price) || price <= 0) {
      setError('Informe um preço válido.');
      return;
    }

    setLoading(true);
    setError(null);

    const res = await fetch('/api/alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, targetPrice: price }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data?.message || 'Erro ao criar alerta.');
      return;
    }

    track('alert_created');
    onCreated();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">

        <h2 className="text-2xl font-black text-[#111827]">Criar alerta</h2>

        <p className="mt-1 text-sm text-[#6b7280] line-clamp-2">{productTitle}</p>

        <p className="mt-3 text-sm text-[#6b7280]">
          Preço atual:{' '}
          <span className="font-bold text-[#111827]">R$ {currentPrice.toFixed(2)}</span>
        </p>

        <div className="mt-6">
          <label className="text-sm font-semibold text-[#111827]">
            Me notificar quando o preço chegar em:
          </label>
          <div className="mt-2 flex items-center gap-2 rounded-2xl border border-[#e5e7eb] bg-[#fafafa] px-4">
            <span className="text-sm font-bold text-[#6b7280]">R$</span>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="0,00"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              className="h-14 flex-1 bg-transparent text-base outline-none"
            />
          </div>
        </div>

        {error && (
          <p className="mt-3 text-sm text-red-500">{error}</p>
        )}

        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-2xl border border-[#e5e7eb] py-3 text-sm font-semibold text-[#6b7280] hover:bg-[#f5f5f7]"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 rounded-2xl bg-[#6f36ff] py-3 text-sm font-bold text-white hover:bg-[#5a28cc] disabled:opacity-50"
          >
            {loading ? 'Salvando...' : 'Criar alerta 🔔'}
          </button>
        </div>

      </div>
    </div>
  );
}
