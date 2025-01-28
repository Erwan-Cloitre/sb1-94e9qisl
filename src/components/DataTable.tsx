import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Mail, Copy } from 'lucide-react';
import type { EmailRecord } from '../types';

interface DataTableProps {
  records: EmailRecord[];
}

export function DataTable({ records }: DataTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const recordsPerPage = 10;

  const sortedRecords = [...records].sort((a, b) => {
    return sortDirection === 'asc'
      ? a.email.localeCompare(b.email)
      : b.email.localeCompare(a.email);
  });

  const totalPages = Math.ceil(records.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const displayedRecords = sortedRecords.slice(
    startIndex,
    startIndex + recordsPerPage
  );

  const toggleSort = () => {
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  };

  const copyEmail = async (email: string) => {
    try {
      await navigator.clipboard.writeText(email);
      alert('Email copié !');
    } catch (err) {
      console.error('Erreur lors de la copie:', err);
    }
  };

  return (
    <div className="mt-8">
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-50">
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={toggleSort}
              >
                <div className="flex items-center gap-2">
                  <Mail size={16} />
                  <span>Email</span>
                  {sortDirection === 'asc' ? (
                    <ChevronUp size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ligne d'origine
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {displayedRecords.map((record, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {record.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {record.originalRow}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => copyEmail(record.email)}
                    className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <Copy size={16} />
                    <span>Copier</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4 px-4">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border rounded-md disabled:opacity-50"
          >
            Précédent
          </button>
          <span className="text-sm text-gray-600">
            Page {currentPage} sur {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage(Math.min(totalPages, currentPage + 1))
            }
            disabled={currentPage === totalPages}
            className="px-4 py-2 border rounded-md disabled:opacity-50"
          >
            Suivant
          </button>
        </div>
      )}
    </div>
  );
}