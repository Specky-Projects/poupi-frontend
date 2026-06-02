'use client';

import { AdminTablePage } from '../components/AdminTablePage';

export default function AdminOffersPage() {
  return <AdminTablePage title="Ofertas" description="Preços atuais, estoque, inconsistências e refresh manual por marketplace." endpoint="/admin/offers" filters={[{ key: 'status', label: 'Estoque', options: ['in', 'out'] }]} columns={[
    { key: 'product.title', label: 'Produto' },
    { key: 'marketplace.name', label: 'Marketplace' },
    { key: 'price', label: 'Preço', render: (row) => `R$ ${Number(row.price).toFixed(2)}` },
    { key: 'availability', label: 'Estoque', render: (row) => row.availability ? 'Disponível' : 'Indisponível' },
    { key: 'lastCheckedAt', label: 'Última checagem', render: (row) => new Date(row.lastCheckedAt).toLocaleString('pt-BR') },
    { key: 'inconsistency', label: 'Issues', render: (row) => row.inconsistency?.join(', ') || '-' },
  ]} />;
}
