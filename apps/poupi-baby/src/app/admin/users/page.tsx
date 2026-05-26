'use client';

import { AdminTablePage } from '../components/AdminTablePage';

export default function AdminUsersPage() {
  return <AdminTablePage title="Usuarios" description="Usuarios, roles, bloqueios, watchlists e atividade operacional." endpoint="/admin/users" filters={[{ key: 'role', label: 'Role', options: ['free', 'premium', 'admin'] }, { key: 'status', label: 'Status', options: ['active', 'blocked'] }]} columns={[
    { key: 'name', label: 'Nome' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role' },
    { key: '_count.alerts', label: 'Alertas' },
    { key: 'deletedAt', label: 'Status', render: (row) => row.deletedAt ? 'Bloqueado' : 'Ativo' },
    { key: 'createdAt', label: 'Criado em', render: (row) => new Date(row.createdAt).toLocaleDateString('pt-BR') },
  ]} />;
}
