'use client';

import { AdminTablePage } from '../components/AdminTablePage';

export default function AdminOffersPage() {
  return <AdminTablePage title="Ofertas" description="Precos atuais, estoque, inconsistencias e refresh manual por marketplace." endpoint="/admin/offers" filters={[{ key: 'status', label: 'Estoque', options: ['in', 'out'] }]} columns={[
    { key: 'product.title', label: 'Produto' },
    { key: 'marketplace.name', label: 'Marketplace' },
    { key: 'price', label: 'Preco', render: (row) => `R$ ${Number(row.price).toFixed(2)}` },
    { key: 'availability', label: 'Estoque', render: (row) => row.availability ? 'Disponivel' : 'Indisponivel' },
    { key: 'lastCheckedAt', label: 'Ultima checagem', render: (row) => new Date(row.lastCheckedAt).toLocaleString('pt-BR') },
    { key: 'inconsistency', label: 'Issues', render: (row) => row.inconsistency?.join(', ') || '-' },
  ]} />;
}
