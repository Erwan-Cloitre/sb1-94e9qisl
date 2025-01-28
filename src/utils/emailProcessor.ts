import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { validate } from 'email-validator';
import { EmailRecord, ProcessingStats, ProcessingOptions } from '../types';

export const findEmailColumn = (headers: string[]): number => {
  if (!headers || !Array.isArray(headers)) {
    throw new Error('En-têtes de colonnes invalides');
  }

  const emailKeywords = ['email', 'e-mail', 'mail', 'courriel'];
  const index = headers.findIndex(header => 
    header && emailKeywords.some(keyword => 
      header.toString().toLowerCase().includes(keyword)
    )
  );

  return index;
};

export const mergeEmailLists = (
  existingRecords: EmailRecord[],
  newRecords: EmailRecord[]
): EmailRecord[] => {
  const existingEmails = new Set(existingRecords.map(record => record.email));
  const mergedRecords = [...existingRecords];
  
  newRecords.forEach(record => {
    if (!existingEmails.has(record.email)) {
      mergedRecords.push(record);
      existingEmails.add(record.email);
    }
  });

  return mergedRecords;
};

export const processEmails = (
  data: string[][],
  emailColumnIndex: number,
  options: ProcessingOptions,
  existingRecords: EmailRecord[] = []
): { records: EmailRecord[], stats: ProcessingStats } => {
  if (!Array.isArray(data) || !data.length) {
    throw new Error('Données invalides ou vides');
  }

  if (emailColumnIndex < 0 || emailColumnIndex >= data[0].length) {
    throw new Error('Index de colonne email invalide');
  }

  const stats: ProcessingStats = {
    totalEmails: 0,
    duplicatesRemoved: 0,
    invalidEmails: 0
  };

  // Première passe : créer les records et identifier les emails invalides
  let records: EmailRecord[] = data
    .slice(1) // Skip header row
    .map((row, index) => {
      const email = row[emailColumnIndex]?.toString().trim().toLowerCase();
      
      if (!email) {
        stats.invalidEmails++;
        return {
          email: '',
          isValid: false,
          isDuplicate: false,
          originalRow: index + 2
        };
      }

      const isValid = validate(email);
      if (!isValid) stats.invalidEmails++;
      
      return {
        email,
        isValid,
        isDuplicate: false,
        originalRow: index + 2
      };
    })
    .filter(record => record.email !== '');

  stats.totalEmails = records.length;

  if (stats.totalEmails === 0) {
    throw new Error('Aucun email trouvé dans le fichier');
  }

  // Supprimer les emails invalides si l'option est activée
  if (options.removeInvalid) {
    records = records.filter(record => record.isValid);
  }

  // Fusionner avec les enregistrements existants si présents
  if (existingRecords.length > 0) {
    records = mergeEmailLists(existingRecords, records);
  }

  // Détecter et supprimer les doublons si l'option est activée
  if (options.removeDuplicates) {
    const emailCounts = new Map<string, number>();
    
    // Compter les occurrences de chaque email
    records.forEach(record => {
      if (record.isValid) {
        emailCounts.set(record.email, (emailCounts.get(record.email) || 0) + 1);
      }
    });

    // Marquer les doublons
    records = records.map(record => ({
      ...record,
      isDuplicate: record.isValid && emailCounts.get(record.email)! > 1
    }));

    // Garder uniquement la première occurrence de chaque email
    const seen = new Set<string>();
    records = records.filter(record => {
      if (!record.isValid) return true;
      
      if (seen.has(record.email)) {
        stats.duplicatesRemoved++;
        return false;
      }
      
      seen.add(record.email);
      return true;
    });
  }

  // Trier par ordre alphabétique si l'option est activée
  if (options.sortAlphabetically) {
    records.sort((a, b) => a.email.localeCompare(b.email));
  }

  return { records, stats };
};

export const exportToExcel = (records: EmailRecord[]): Blob => {
  if (!records || !Array.isArray(records) || records.length === 0) {
    throw new Error('Aucune donnée à exporter');
  }

  const worksheet = XLSX.utils.json_to_sheet(
    records.map(({ email, originalRow }) => ({
      Email: email,
      'Ligne d\'origine': originalRow
    }))
  );
  
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Emails');
  
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
};

export const exportToCSV = (records: EmailRecord[]): Blob => {
  if (!records || !Array.isArray(records) || records.length === 0) {
    throw new Error('Aucune donnée à exporter');
  }

  const csv = Papa.unparse(
    records.map(({ email, originalRow }) => ({
      Email: email,
      'Ligne d\'origine': originalRow
    }))
  );
  
  return new Blob([csv], { type: 'text/csv;charset=utf-8;' });
};