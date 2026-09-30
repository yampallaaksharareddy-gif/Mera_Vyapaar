import { TransactionType } from '../types';

export interface ParsedReceiptData {
  vendor: string;
  amount: number | '';
  category: string;
  dateStr: string;
  transactionType: TransactionType;
  rawText: string;
}

/**
 * Intelligent parser that extracts vendor name, transaction date, total amount,
 * and category from raw OCR text returned by BHASHINI OCR.
 */
export const parseReceiptOcrText = (rawText: string): ParsedReceiptData => {
  const lines = rawText
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  let vendor = '';
  let amount: number | '' = '';
  let category = 'General Trade & Retail';
  let transactionType: TransactionType = 'EXPENSE';
  let dateStr = new Date().toISOString().split('T')[0];

  // 1. Detect Vendor / Store Name from top lines
  const ignoreKeywords = [
    'TAX',
    'INVOICE',
    'RECEIPT',
    'BILL',
    'CASH',
    'MEMO',
    'SLIP',
    'DATE',
    'TIME',
    'TOTAL',
    'TEL',
    'PHONE',
    'MOB',
    'GSTIN',
    'WELCOME',
    'THANK'
  ];

  for (const line of lines.slice(0, 5)) {
    const upper = line.toUpperCase();
    if (!ignoreKeywords.some((kw) => upper.includes(kw)) && line.length > 2) {
      // Remove symbols and clean vendor string
      vendor = line.replace(/[^\w\s\.\&\-]/g, '').trim();
      if (vendor) break;
    }
  }

  if (!vendor) {
    vendor = lines[0] ? lines[0].replace(/[^\w\s\.\&\-]/g, '').trim() : 'Local Merchant';
  }

  // 2. Detect Date (DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD, DD.MM.YYYY)
  const dateRegex = /(\b\d{1,2}[\/\.\-]\d{1,2}[\/\.\-]\d{2,4}\b)|(\b\d{4}[\/\.\-]\d{1,2}[\/\.\-]\d{1,2}\b)/;
  for (const line of lines) {
    const match = line.match(dateRegex);
    if (match) {
      const rawMatch = match[0].replace(/\./g, '-').replace(/\//g, '-');
      const parts = rawMatch.split('-');

      if (parts.length === 3) {
        let y = parseInt(parts[0], 10);
        let m = parseInt(parts[1], 10);
        let d = parseInt(parts[2], 10);

        // Check if format is DD-MM-YYYY
        if (y < 32 && d > 1000) {
          const temp = y;
          y = d;
          d = temp;
        } else if (y < 32 && d < 32) {
          // Assume DD-MM-YYYY
          const temp = y;
          y = d > 2000 ? d : 2026;
          d = temp;
        }

        if (y > 2000 && m >= 1 && m <= 12 && d >= 1 && d <= 31) {
          const mm = String(m).padStart(2, '0');
          const dd = String(d).padStart(2, '0');
          dateStr = `${y}-${mm}-${dd}`;
          break;
        }
      }
    }
  }

  // 3. Detect Total Amount
  const totalKeywords = ['TOTAL', 'GRAND TOTAL', 'NET TOTAL', 'NET AMOUNT', 'AMOUNT', 'PAYABLE', 'BAL', 'BALANCE'];
  let maxFoundAmount = 0;

  for (const line of lines) {
    const upper = line.toUpperCase();
    const containsTotalKw = totalKeywords.some((kw) => upper.includes(kw));

    // Match numeric monetary figures (e.g. ₹1,250.00, Rs. 450, 1250)
    const amountMatches = line.match(/(?:(?:₹|RS|INR)\.?\s*)?(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?)/gi);
    if (amountMatches) {
      for (const rawVal of amountMatches) {
        const cleanVal = rawVal.replace(/[^\d\.]/g, '');
        const val = parseFloat(cleanVal);

        // Exclude integers that look like 10-digit phone numbers, GSTIN numbers or timestamps
        if (!isNaN(val) && val > 0 && val < 500000 && val !== 1000000) {
          if (cleanVal.length >= 10 && !cleanVal.includes('.')) {
            continue; // likely phone or invoice number
          }
          if (containsTotalKw) {
            maxFoundAmount = val;
            break;
          } else if (val > maxFoundAmount) {
            maxFoundAmount = val;
          }
        }
      }
    }
    if (containsTotalKw && maxFoundAmount > 0) break;
  }

  if (maxFoundAmount > 0) {
    amount = maxFoundAmount;
  }

  // 4. Detect Category & Transaction Type based on OCR keywords
  const textUpper = rawText.toUpperCase();
  if (
    textUpper.includes('MANDI') ||
    textUpper.includes('CROP') ||
    textUpper.includes('GRAIN') ||
    textUpper.includes('WHEAT') ||
    textUpper.includes('PADDY') ||
    textUpper.includes('COTTON') ||
    textUpper.includes('APMC') ||
    textUpper.includes('HARVEST')
  ) {
    category = 'Agri Produce & Mandi';
    transactionType = 'INCOME';
  } else if (
    textUpper.includes('HANDLOOM') ||
    textUpper.includes('FABRIC') ||
    textUpper.includes('YARN') ||
    textUpper.includes('TEXTILE') ||
    textUpper.includes('CLOTH')
  ) {
    category = 'Artisan & Handloom';
    transactionType = 'EXPENSE';
  } else if (
    textUpper.includes('FERTILIZER') ||
    textUpper.includes('SEED') ||
    textUpper.includes('PESTICIDE') ||
    textUpper.includes('KHAT') ||
    textUpper.includes('KISAN')
  ) {
    category = 'Seeds & Fertilizers';
    transactionType = 'EXPENSE';
  } else if (
    textUpper.includes('MILK') ||
    textUpper.includes('DAIRY') ||
    textUpper.includes('FEED') ||
    textUpper.includes('CATTLE')
  ) {
    category = 'Dairy & Livestock';
    transactionType = 'EXPENSE';
  } else if (
    textUpper.includes('SALE') ||
    textUpper.includes('INCOME') ||
    textUpper.includes('RECEIPT')
  ) {
    transactionType = 'INCOME';
  }

  return {
    vendor,
    amount,
    category,
    dateStr,
    transactionType,
    rawText
  };
};
