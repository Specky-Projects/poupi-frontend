'use client';

import { useCallback } from 'react';
import { useSession } from 'next-auth/react';

const API = '/api/admin';

export function useAdminApi() {
  const { data: session, status } = useSession();
  const token = session?.backendToken;

  const request = useCallback(async function request<T>(path: string, init?: RequestInit): Promise<T> {
    if (!token) throw new Error('Sessao admin indisponivel');
    const adminPath = path.startsWith('/admin/') ? path.slice('/admin'.length) : path;
    const res = await fetch(`${API}${adminPath}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
    });
    if (!res.ok) throw new Error(`Erro ${res.status} ao carregar ${path}`);
    return res.json();
  }, [token]);

  return { request, ready: status === 'authenticated' && !!token };
}
