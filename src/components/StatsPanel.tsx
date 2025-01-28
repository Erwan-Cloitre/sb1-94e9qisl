import React from 'react';
import { FileText, AlertTriangle, Copy } from 'lucide-react';
import type { ProcessingStats } from '../types';

interface StatsPanelProps {
  stats: ProcessingStats;
}

export function StatsPanel({ stats }: StatsPanelProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mt-6 mb-8">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <FileText size={20} />
        Résumé du traitement
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-blue-600 text-sm font-medium">Total des emails</div>
          <div className="text-2xl font-bold text-blue-700">{stats.totalEmails}</div>
        </div>

        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="text-orange-600 text-sm font-medium">Doublons supprimés</div>
          <div className="text-2xl font-bold text-orange-700">
            {stats.duplicatesRemoved}
          </div>
        </div>

        <div className="bg-red-50 p-4 rounded-lg">
          <div className="text-red-600 text-sm font-medium">Emails invalides</div>
          <div className="text-2xl font-bold text-red-700">{stats.invalidEmails}</div>
        </div>
      </div>

      {(stats.duplicatesRemoved > 0 || stats.invalidEmails > 0) && (
        <div className="mt-4 p-4 bg-yellow-50 rounded-lg flex items-start gap-3">
          <AlertTriangle className="text-yellow-600 flex-shrink-0 mt-1" size={20} />
          <div className="text-sm text-yellow-700">
            <p className="font-medium mb-1">Attention</p>
            <ul className="list-disc list-inside space-y-1">
              {stats.duplicatesRemoved > 0 && (
                <li>
                  {stats.duplicatesRemoved} email(s) en double ont été identifiés
                </li>
              )}
              {stats.invalidEmails > 0 && (
                <li>{stats.invalidEmails} email(s) invalides détectés</li>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}