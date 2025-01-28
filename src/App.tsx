import React, { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { DataTable } from './components/DataTable';
import { ProcessingOptions } from './types';
import { Settings, FileSpreadsheet, Download, RefreshCw, FilePlus } from 'lucide-react';
import { ProcessingStats, EmailRecord } from './types';
import { SettingsPanel } from './components/SettingsPanel';
import { StatsPanel } from './components/StatsPanel';
import { exportToExcel, exportToCSV } from './utils/emailProcessor';

function App() {
  const [records, setRecords] = useState<EmailRecord[]>([]);
  const [stats, setStats] = useState<ProcessingStats | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [options, setOptions] = useState<ProcessingOptions>({
    removeDuplicates: true,
    removeInvalid: true,
    sortAlphabetically: true,
  });

  const handleExport = async (format: 'xlsx' | 'csv') => {
    if (!records.length) return;

    const timestamp = new Date().toISOString().split('T')[0];
    const fileName = `Liste_Emails_Triee_${timestamp}`;
    
    const blob = format === 'xlsx' 
      ? exportToExcel(records)
      : exportToCSV(records);
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleNewRecords = (newRecords: EmailRecord[]) => {
    setRecords(prevRecords => {
      if (prevRecords.length === 0) {
        return newRecords;
      }
      // Fusionner les nouveaux enregistrements avec les existants
      const existingEmails = new Set(prevRecords.map(record => record.email));
      const uniqueNewRecords = newRecords.filter(record => !existingEmails.has(record.email));
      return [...prevRecords, ...uniqueNewRecords];
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Gestionnaire de Listes Email
          </h1>
          <p className="text-gray-600">
            Importez, nettoyez et organisez vos listes d'emails en quelques clics
          </p>
        </header>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Settings size={20} />
              <span>Paramètres</span>
            </button>

            <div className="flex gap-4">
              <button
                onClick={() => handleExport('xlsx')}
                disabled={!records.length}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileSpreadsheet size={20} />
                <span>Exporter XLSX</span>
              </button>
              <button
                onClick={() => handleExport('csv')}
                disabled={!records.length}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download size={20} />
                <span>Exporter CSV</span>
              </button>
            </div>
          </div>

          {showSettings && (
            <SettingsPanel
              options={options}
              onOptionsChange={setOptions}
              onClose={() => setShowSettings(false)}
            />
          )}

          <div className="space-y-6">
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FilePlus size={20} />
                Importer un nouveau fichier
              </h3>
              <FileUpload
                onUpload={handleNewRecords}
                onStatsUpdate={setStats}
                options={options}
                onProcessingChange={setIsProcessing}
                existingRecords={records}
              />
            </div>
          </div>

          {stats && <StatsPanel stats={stats} />}

          {isProcessing && (
            <div className="flex items-center justify-center gap-3 my-4 text-blue-600">
              <RefreshCw className="animate-spin" size={24} />
              <span className="text-lg">Traitement en cours...</span>
            </div>
          )}

          {records.length > 0 && (
            <DataTable records={records} />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;