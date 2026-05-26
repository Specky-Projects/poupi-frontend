'use client';

import { AdminTablePage } from '../components/AdminTablePage';

export default function AdminProductsPage() {
  return <AdminTablePage title="Produtos" description="Catalogo multi-vertical, SKUs curados, matching e ofertas por marketplace." endpoint="/admin/products" filters={[{ key: 'status', label: 'Status', options: ['active', 'inactive'] }]} columns={[
    { key: 'title', label: 'Produto' },
    { key: 'brand', label: 'Marca' },
    { key: 'category', label: 'Categoria' },
    { key: 'offers', label: 'Ofertas', render: (row) => row.offers?.length ?? 0 },
    { key: '_count.alerts', label: 'Monitorados' },
    { key: 'deletedAt', label: 'Status', render: (row) => row.deletedAt ? 'Inativo' : 'Ativo' },
  ]} />;
}
