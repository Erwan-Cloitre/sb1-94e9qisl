import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { Upload } from 'lucide-react';
import { findEmailColumn, processEmails } from '../utils/emailProcessor';
import type { EmailRecord, ProcessingStats, ProcessingOptions } from '../types';

interface FileUploadProps {
  onUpload: (records: EmailRecord[]) => void;
  onStatsUpdate: (stats: ProcessingStats) => void;
  options: ProcessingOptions;
  onProcessingChange: (isProcessing: boolean) => void;
  existingRecords?: EmailRecord[];
}

export function FileUpload({ 
  onUpload, 
  onStatsUpdate, 
  options, 
  onProcessingChange,
  existingRecords = []
}: FileUploadProps) {
  const processFile = async (file: File) => {
    onProcessingChange(true);
    
    try {
      let data: string[][];
      
      if (file.name.endsWith('.csv')) {
        const text = await file.text();
        const parseResult = Papa.parse(text, {
          skipEmptyLines: true,
          error: (error) => {
            throw new Error(`Erreur lors de l'analyse CSV: ${error.message}`);
          }
        });
        
        if (parseResult.errors.length > 0) {
          throw new Error(`Erreur lors de l'analyse CSV: ${parseResult.errors[0].message}`);
        }
        
        data = parseResult.data as string[][];
      } else {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'array' });
        
        if (!workbook.SheetNames.length) {
          throw new Error('Le fichier Excel ne contient aucune feuille de calcul');
        }
        
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        data = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
      }

      if (!data || !data.length) {
        throw new Error('Le fichier est vide');
      }

      const emailColumnIndex = findEmailColumn(data[0]);
      
      if (emailColumnIndex === -1) {
        throw new Error("Aucune colonne d'email trouvée. Assurez-vous que votre fichier contient une colonne avec 'email', 'e-mail', 'mail' ou 'courriel' dans son titre.");
      }

      const { records, stats } = processEmails(data, emailColumnIndex, options, existingRecords);
      
      if (!records.length) {
        throw new Error('Aucun email valide trouvé dans le fichier');
      }

      onUpload(records);
      onStatsUpdate(stats);
    } catch (error) {
      console.error('Erreur lors du traitement du fichier:', error);
      alert(error instanceof Error ? error.message : 'Une erreur inattendue est survenue lors du traitement du fichier');
    } finally {
      onProcessingChange(false);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert('Le fichier est trop volumineux. La taille maximale est de 10MB.');
        return;
      }
      processFile(file);
    }
  }, [options, existingRecords]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/csv': ['.csv']
    },
    multiple: false
  });

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
        transition-colors duration-200 ease-in-out
        ${isDragActive 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}
      `}
    >
      <input {...getInputProps()} />
      <Upload 
        className={`mx-auto mb-4 ${isDragActive ? 'text-blue-500' : 'text-gray-400'}`} 
        size={48} 
      />
      <p className="text-lg text-gray-600 mb-2">
        {isDragActive
          ? 'Déposez le fichier ici...'
          : 'Glissez-déposez un fichier XLSX ou CSV ici, ou cliquez pour sélectionner'}
      </p>
      <p className="text-sm text-gray-500">
        Formats supportés: .xlsx, .csv
      </p>
    </div>
  );
}