'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth-simple';
import { UsuariosDB } from '@/lib/db';
import UsersTable from '@/components/usuarios/table';
import SearchInput from '@/components/ui/search-input';

const ITEMS_PER_PAGE = 10;

export default function UsuariosPage() {
  const router = useRouter();
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [query, setQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.replace('/login');
      return;
    }
    setIsAdmin(user.rol === 'ADMIN');
    loadData('', 1);
  }, [router]);

  const loadData = (q: string, page: number = 1) => {
    setLoading(true);
    const offset = (page - 1) * ITEMS_PER_PAGE;

    const allUsers = UsuariosDB.findMany({
      orderBy: { createdAt: 'desc' },
    });

    // Filter by query
    const filtered = q
      ? allUsers.filter(u =>
          u.nombre?.toLowerCase().includes(q.toLowerCase()) ||
          u.email?.toLowerCase().includes(q.toLowerCase())
        )
      : allUsers;

    const pages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
    const paginated = filtered.slice(offset, offset + ITEMS_PER_PAGE);

    setUsuarios(paginated);
    setTotalPages(pages);
    setCurrentPage(page);
    setQuery(q);
    setLoading(false);
  };

  const handleSearch = (q: string) => {
    loadData(q, 1);
  };

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Usuarios</h1>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <div className="relative flex flex-1 shrink-0">
          <label htmlFor="search" className="sr-only">Buscar</label>
          <SearchInput placeholder="Buscar usuarios..." onSearch={handleSearch} />
        </div>
        {isAdmin && (
          <Link
            href="/admin/usuarios/create"
            className="flex h-10 items-center rounded-lg bg-[var(--primary-color)] px-4 text-sm font-medium text-white transition-colors hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <span className="hidden md:block">Crear Usuario</span>
            <span className="md:hidden">+</span>
          </Link>
        )}
      </div>
      {loading ? (
        <div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div></div>
      ) : (
        <>
          <UsersTable users={usuarios} />
          <div className="mt-5 flex w-full justify-center">
            {totalPages > 1 && (
              <div className="flex gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => loadData(query, page)}
                    className={`px-3 py-1 rounded ${currentPage === page ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
