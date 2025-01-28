import React from 'react';
import { X } from 'lucide-react';
import type { ProcessingOptions } from '../types';

interface SettingsPanelProps {
  options: ProcessingOptions;
  onOptionsChange: (options: ProcessingOptions) => void;
  onClose: () => void;
}

export function SettingsPanel({ options, onOptionsChange, onClose }: SettingsPanelProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-6 mb-6 relative">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
      >
        <X size={20} />
      </button>

      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Paramètres de traitement
      </h3>

      <div className="space-y-4">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={options.removeDuplicates}
            onChange={(e) =>
              onOptionsChange({
                ...options,
                removeDuplicates: e.target.checked,
              })
            }
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <span className="text-gray-700">Supprimer les doublons</span>
        </label>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={options.removeInvalid}
            onChange={(e) =>
              onOptionsChange({
                ...options,
                removeInvalid: e.target.checked,
              })
            }
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <span className="text-gray-700">Supprimer les emails invalides</span>
        </label>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={options.sortAlphabetically}
            onChange={(e) =>
              onOptionsChange({
                ...options,
                sortAlphabetically: e.target.checked,
              })
            }
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <span className="text-gray-700">Trier par ordre alphabétique</span>
        </label>
      </div>
    </div>
  );
}