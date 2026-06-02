'use client';

import { AdminTablePage } from '../components/AdminTablePage';

export default function AdminAlertsPage() {
  return <AdminTablePage title="Alertas" description="Alertas de preço, watchlist e notificacoes inteligentes." endpoint="/admin/alerts" filters={[{ key: 'status', label: 'Status', options: ['active', 'inactive'] }]} columns={[
    { key: 'product.title', label: 'Produto' },
    { key: 'user.email', label: 'Usuario' },
    { key: 'targetPrice', label: 'Meta', render: (row) => `R$ ${Number(row.targetPrice).toFixed(2)}` },
    { key: 'active', label: 'Status', render: (row) => row.active ? 'Ativo' : 'Inativo' },
    { key: 'createdAt', label: 'Criado em', render: (row) => new Date(row.createdAt).toLocaleString('pt-BR') },
  ]} />;
}
