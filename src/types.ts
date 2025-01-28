export interface EmailRecord {
  email: string;
  isValid: boolean;
  isDuplicate: boolean;
  originalRow?: number;
}

export interface ProcessingStats {
  totalEmails: number;
  duplicatesRemoved: number;
  invalidEmails: number;
}

export interface ProcessingOptions {
  removeDuplicates: boolean;
  removeInvalid: boolean;
  sortAlphabetically: boolean;
}