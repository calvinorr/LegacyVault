const PDF2JSON = require('pdf2json');

/**
 * Parse PDF buffer and return structured content
 * @param {Buffer} buffer - PDF file buffer
 * @param {number} timeout - Timeout in milliseconds (default: 30000)
 * @returns {Promise<Object>} Parsed PDF content
 */
async function parsePdfBuffer(buffer, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDF2JSON();
    
    let timeoutId;
    let isResolved = false;

    // Set timeout
    if (timeout > 0) {
      timeoutId = setTimeout(() => {
        if (!isResolved) {
          isResolved = true;
          reject(new Error('PDF parsing timeout'));
        }
      }, timeout);
    }

    pdfParser.on('pdfParser_dataReady', (pdfData) => {
      if (!isResolved) {
        isResolved = true;
        if (timeoutId) clearTimeout(timeoutId);
        resolve(pdfData);
      }
    });

    pdfParser.on('pdfParser_dataError', (error) => {
      if (!isResolved) {
        isResolved = true;
        if (timeoutId) clearTimeout(timeoutId);
        reject(error);
      }
    });

    try {
      pdfParser.parseBuffer(buffer);
    } catch (error) {
      if (!isResolved) {
        isResolved = true;
        if (timeoutId) clearTimeout(timeoutId);
        reject(error);
      }
    }
  });
}

/**
 * Identify bank from PDF content
 * @param {Object} pdfContent - Parsed PDF content
 * @returns {string} Bank name
 */
function identifyBankFromContent(pdfContent) {
  const textContent = extractAllText(pdfContent).toUpperCase();

  // DEBUG: Log first 500 chars of extracted text
  console.log('[PDF PROCESSOR DEBUG] Extracted text preview (first 500 chars):');
  console.log(textContent.substring(0, 500));
  console.log('[PDF PROCESSOR DEBUG] Total text length:', textContent.length);

  // Check for HSBC-specific transaction patterns first (more reliable than just bank name)
  // HSBC uses specific date format and transaction type codes
  const hasHSBCDatePattern = /\d{1,2}\s+(?:JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)\s+\d{2}/i.test(textContent);
  const hasHSBCTransactionTypes = /\b(DD|SO|VIS INT'L|VIS|OBP)\s+[A-Z]/i.test(textContent);

  if (hasHSBCDatePattern && hasHSBCTransactionTypes) {
    console.log('[PDF PROCESSOR DEBUG] Identified bank: HSBC (based on date format and transaction type patterns)');
    return 'HSBC';
  }

  // If HSBC patterns not found, check for explicit bank mentions
  // Order matters: check specific banks first before generic patterns
  const bankPatterns = {
    'HSBC': ['HSBC UK BANK', 'HSBC BANK'],
    'NatWest': ['NATWEST', 'NAT WEST', 'NATIONAL WESTMINSTER'],
    'Barclays': ['BARCLAYS BANK PLC', 'BARCLAYS PLC'],
    'Lloyds': ['LLOYDS BANK PLC', 'LLOYDS'],
    'Santander': ['SANTANDER UK PLC', 'SANTANDER'],
    'TSB': ['TSB BANK', 'THE SAVINGS BANK'],
    'Halifax': ['HALIFAX PLC', 'HALIFAX'],
    'Nationwide': ['NATIONWIDE BUILDING SOCIETY', 'NATIONWIDE'],
    'Co-operative': ['CO-OPERATIVE BANK', 'COOP BANK'],
    'First Direct': ['FIRST DIRECT']
  };

  for (const [bankName, patterns] of Object.entries(bankPatterns)) {
    for (const pattern of patterns) {
      if (textContent.includes(pattern)) {
        console.log(`[PDF PROCESSOR DEBUG] Identified bank: ${bankName} (based on pattern: ${pattern})`);
        return bankName;
      }
    }
  }

  console.log('[PDF PROCESSOR DEBUG] Bank not identified, returning "Unknown"');
  return 'Unknown';
}

/**
 * Extract all text from PDF content
 * @param {Object} pdfContent - Parsed PDF content
 * @returns {string} Combined text content
 */
function extractAllText(pdfContent) {
  if (!pdfContent.Pages || !Array.isArray(pdfContent.Pages)) {
    return '';
  }

  let allText = '';

  for (const page of pdfContent.Pages) {
    if (page.Texts && Array.isArray(page.Texts)) {
      for (const textItem of page.Texts) {
        if (textItem.R && Array.isArray(textItem.R)) {
          for (const textRun of textItem.R) {
            if (textRun.T) {
              // Decode URL-encoded text
              const decodedText = decodeURIComponent(textRun.T);
              allText += decodedText + ' ';
            }
          }
        }
      }
    }
  }

  return allText;
}

/**
 * Extract transactions from PDF content
 * @param {Object} pdfContent - Parsed PDF content
 * @param {string} bankName - Identified bank name
 * @returns {Promise<Array>} Array of extracted transactions
 */
async function extractTransactions(pdfContent, bankName) {
  const textContent = extractAllText(pdfContent);
  const transactions = [];
  let accountNumber = null;
  let sortCode = null;
  let statementPeriod = null;

  console.log(`[PDF PROCESSOR DEBUG] Extracting transactions for bank: ${bankName}`);

  // Extract account details
  const accountMatch = textContent.match(/Account\s+Number[:\s]+(\d{6,12})/i);
  if (accountMatch) {
    const fullAccount = accountMatch[1];
    accountNumber = `****${fullAccount.slice(-4)}`; // Mask all but last 4 digits
    console.log(`[PDF PROCESSOR DEBUG] Found account number: ${accountNumber}`);
  } else {
    console.log('[PDF PROCESSOR DEBUG] No account number found');
  }

  const sortCodeMatch = textContent.match(/Sort\s+Code[:\s]+(\d{2}[-\s]?\d{2}[-\s]?\d{2})/i);
  if (sortCodeMatch) {
    sortCode = sortCodeMatch[1].replace(/\s+/g, '-');
    console.log(`[PDF PROCESSOR DEBUG] Found sort code: ${sortCode}`);
  } else {
    console.log('[PDF PROCESSOR DEBUG] No sort code found');
  }

  // Extract statement period
  const periodMatch = textContent.match(/Statement\s+Period[:\s]+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\s+to\s+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i);
  if (periodMatch) {
    statementPeriod = {
      start: parseUKDate(periodMatch[1]),
      end: parseUKDate(periodMatch[2])
    };
    console.log(`[PDF PROCESSOR DEBUG] Found statement period:`, statementPeriod);
  } else {
    console.log('[PDF PROCESSOR DEBUG] No statement period found');
  }

  // Parse transactions based on bank format
  let result;
  switch (bankName) {
    case 'NatWest':
      console.log('[PDF PROCESSOR DEBUG] Using NatWest parser');
      result = await extractNatWestTransactions(textContent, { accountNumber, sortCode, statementPeriod });
      break;
    case 'Barclays':
      console.log('[PDF PROCESSOR DEBUG] Using Barclays parser');
      result = await extractBarclaysTransactions(textContent, { accountNumber, sortCode, statementPeriod });
      break;
    case 'HSBC':
      console.log('[PDF PROCESSOR DEBUG] Using HSBC parser');
      result = await extractHSBCTransactions(textContent, { accountNumber, sortCode, statementPeriod });
      break;
    default:
      console.log('[PDF PROCESSOR DEBUG] Using Generic parser (fallback)');
      result = await extractGenericTransactions(textContent, { accountNumber, sortCode, statementPeriod });
      break;
  }

  console.log(`[PDF PROCESSOR DEBUG] Extraction complete. Found ${result.length} transactions`);
  if (result.length > 0) {
    console.log('[PDF PROCESSOR DEBUG] Sample transaction:', JSON.stringify(result[0], null, 2));
  }

  return result;
}

/**
 * Extract NatWest transactions
 */
async function extractNatWestTransactions(textContent, metadata) {
  const transactions = [];
  const lines = textContent.split('\n');
  
  let currentTransaction = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Look for date pattern (DD/MM/YYYY or DD/MM/YY)
    const dateMatch = line.match(/(\d{1,2}\/\d{1,2}\/\d{2,4})/);
    if (dateMatch) {
      // If we have a current transaction, save it
      if (currentTransaction && currentTransaction.description && currentTransaction.amount !== null) {
        transactions.push(currentTransaction);
      }
      
      // Start new transaction
      currentTransaction = {
        date: parseUKDate(dateMatch[1]),
        description: '',
        amount: null,
        balance: null,
        originalText: line
      };
      
      // Look for description and amount in surrounding lines
      for (let j = i; j < Math.min(i + 5, lines.length); j++) {
        const nextLine = lines[j].trim();
        
        // Look for amount pattern (with negative sign or decimal)
        const amountMatch = nextLine.match(/([-+]?)([£]?)(\d{1,3}(?:,\d{3})*\.?\d{0,2})/);
        if (amountMatch && !currentTransaction.amount) {
          let amount = parseFloat(amountMatch[3].replace(/,/g, ''));
          
          // Determine if it's debit or credit
          if (amountMatch[1] === '-' || nextLine.includes('DR') || nextLine.includes('O/D')) {
            amount = -amount;
          } else if (amountMatch[1] === '+' || nextLine.includes('CR')) {
            amount = Math.abs(amount);
          } else {
            // Default assumption for transactions without clear indicators
            // Most bank transactions are debits unless clearly marked as credits
            if (amount < 1000 && !nextLine.includes('SALARY') && !nextLine.includes('CREDIT')) {
              amount = -amount;
            }
          }
          
          currentTransaction.amount = amount;
        }
        
        // Look for balance
        const balanceMatch = nextLine.match(/Balance[:\s]*([£]?)(\d{1,3}(?:,\d{3})*\.?\d{0,2})/i);
        if (balanceMatch && !currentTransaction.balance) {
          currentTransaction.balance = parseFloat(balanceMatch[2].replace(/,/g, ''));
        }
        
        // Build description from non-numeric lines
        if (!nextLine.match(/^\d/) && !nextLine.match(/^[£\-+]?\d/) && nextLine.length > 0) {
          if (currentTransaction.description && !currentTransaction.description.includes(nextLine)) {
            currentTransaction.description += ' ' + nextLine;
          } else if (!currentTransaction.description) {
            currentTransaction.description = nextLine;
          }
        }
      }
    }
  }
  
  // Add the last transaction if valid
  if (currentTransaction && currentTransaction.description && currentTransaction.amount !== null) {
    transactions.push(currentTransaction);
  }
  
  // Filter and clean transactions
  const validTransactions = transactions.filter(t => 
    t.date && 
    t.description && 
    t.description.trim().length > 0 &&
    t.amount !== null &&
    !isNaN(t.amount)
  );

  // Add metadata to result
  const result = validTransactions.map(t => ({
    ...t,
    description: t.description.trim().replace(/\s+/g, ' ')
  }));

  if (metadata.accountNumber) result.accountNumber = metadata.accountNumber;
  if (metadata.sortCode) result.sortCode = metadata.sortCode;
  if (metadata.statementPeriod) result.statementPeriod = metadata.statementPeriod;

  return result;
}

/**
 * Extract Barclays transactions
 */
async function extractBarclaysTransactions(textContent, metadata) {
  // Barclays format: "15 Oct 2023  DD BRITISH GAS  85.50 O/D  1,234.50"
  const transactions = [];
  const lines = textContent.split('\n');
  
  for (const line of lines) {
    // Barclays date format: "15 Oct 2023"
    const dateMatch = line.match(/(\d{1,2}\s+[A-Za-z]{3}\s+\d{4})/);
    if (dateMatch) {
      const descriptionMatch = line.match(/\d{1,2}\s+[A-Za-z]{3}\s+\d{4}\s+(.+?)\s+(\d+\.?\d*)\s+(O\/D|CR|DR)\s+(\d{1,3}(?:,\d{3})*\.?\d{0,2})/);
      
      if (descriptionMatch) {
        const date = new Date(dateMatch[1]);
        let amount = parseFloat(descriptionMatch[2]);
        const type = descriptionMatch[3];
        const balance = parseFloat(descriptionMatch[4].replace(/,/g, ''));
        
        // O/D = Outgoing/Debit, CR = Credit, DR = Debit
        if (type === 'O/D' || type === 'DR') {
          amount = -amount;
        }
        
        transactions.push({
          date,
          description: descriptionMatch[1].trim(),
          amount,
          balance,
          originalText: line
        });
      }
    }
  }
  
  return transactions;
}

/**
 * Extract HSBC transactions
 */
async function extractHSBCTransactions(textContent, metadata) {
  const transactions = [];
  
  const monthMap = {
    'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
    'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
  };
  
  // First, split by transaction dates to get daily transaction blocks
  const dateRegex = /(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{2})/g;
  const parts = textContent.split(dateRegex);
  
  for (let i = 1; i < parts.length; i += 2) {
    const dateStr = parts[i];
    const transactionText = parts[i + 1] || '';
    
    // Parse the date
    const dateParts = dateStr.match(/(\d{1,2})\s+(\w+)\s+(\d{2})/);
    if (!dateParts) continue;
    
    const day = parseInt(dateParts[1]);
    const month = monthMap[dateParts[2]];
    const year = 2000 + parseInt(dateParts[3]);
    const date = new Date(year, month, day);
    
    // Find all transaction starts in the text (DD, SO, VIS, OBP)
    // Use a more comprehensive regex to capture transaction boundaries
    const transactionPattern = /(?:^|\s)(DD|SO|VIS(?:\s+INT'L)?|OBP)\s+([^0-9]*?)(?=\s+(?:DD|SO|VIS|OBP|\d+\.\d{2}|\d{1,3},\d{3}\.\d{2}|$))/g;
    
    let match;
    const potentialTransactions = [];
    
    while ((match = transactionPattern.exec(transactionText)) !== null) {
      potentialTransactions.push({
        type: match[1],
        description: match[2].trim(),
        startIndex: match.index,
        fullMatch: match[0]
      });
    }
    
    // Now find amounts that follow each transaction
    for (let j = 0; j < potentialTransactions.length; j++) {
      const transaction = potentialTransactions[j];
      const nextTransaction = potentialTransactions[j + 1];
      
      // Look for amount between this transaction and the next one (or end of text)
      const searchStart = transaction.startIndex + transaction.fullMatch.length;
      const searchEnd = nextTransaction ? nextTransaction.startIndex : transactionText.length;
      const searchText = transactionText.substring(searchStart, searchEnd);
      
      // Find the first decimal amount in this section
      const amountMatch = searchText.match(/(\d+\.\d{2})/);
      
      if (amountMatch) {
        const amount = parseFloat(amountMatch[1]);
        
        if (amount > 0 && amount < 50000) { // Reasonable amount range
          // Clean up description (remove extra whitespace and reference numbers)
          let cleanDescription = transaction.description
            .replace(/\s{2,}/g, ' ')
            .replace(/\d{8,}/g, '') // Remove long reference numbers
            .trim();
          
          transactions.push({
            date,
            description: `${transaction.type} ${cleanDescription}`.trim(),
            amount: -amount, // Most transactions are debits
            balance: null,
            originalText: `${dateStr} ${transaction.type} ${transaction.description} ${amountMatch[1]}`
          });
        }
      }
    }
    
    // Handle any remaining amounts that might not have been caught
    // Look for standalone amounts that follow transaction types
    const remainingAmountPattern = /(?:DD|SO|VIS|OBP)\s+[^0-9]*?(\d+\.\d{2})/g;
    let amountMatch;
    
    while ((amountMatch = remainingAmountPattern.exec(transactionText)) !== null) {
      const amount = parseFloat(amountMatch[1]);
      if (amount > 0 && amount < 50000) {
        // Check if we already have this transaction
        const alreadyExists = transactions.some(t => 
          t.date.getTime() === date.getTime() && 
          Math.abs(t.amount) === amount
        );
        
        if (!alreadyExists) {
          // Extract some context around this match
          const contextStart = Math.max(0, amountMatch.index - 50);
          const contextEnd = Math.min(transactionText.length, amountMatch.index + amountMatch[0].length + 10);
          const context = transactionText.substring(contextStart, contextEnd);
          
          transactions.push({
            date,
            description: context.trim(),
            amount: -amount,
            balance: null,
            originalText: `${dateStr} ${context.trim()}`
          });
        }
      }
    }
  }
  
  // Sort by date and remove duplicates
  transactions.sort((a, b) => a.date - b.date);
  
  // Remove potential duplicates (same date, similar amount)
  const uniqueTransactions = [];
  for (const transaction of transactions) {
    const duplicate = uniqueTransactions.find(t => 
      t.date.getTime() === transaction.date.getTime() &&
      Math.abs(Math.abs(t.amount) - Math.abs(transaction.amount)) < 0.01
    );
    
    if (!duplicate) {
      uniqueTransactions.push(transaction);
    }
  }
  
  return uniqueTransactions;
}

/**
 * Extract generic transactions (fallback)
 */
async function extractGenericTransactions(textContent, metadata) {
  console.log('[PDF PROCESSOR DEBUG - GENERIC] Starting generic transaction extraction');

  const transactions = [];
  const datePattern = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/g;
  const amountPattern = /([-+]?)([£]?)(\d{1,3}(?:,\d{3})*\.?\d{0,2})/g;

  const lines = textContent.split('\n');
  console.log(`[PDF PROCESSOR DEBUG - GENERIC] Split text into ${lines.length} lines`);

  // Debug: Show first 10 lines
  console.log('[PDF PROCESSOR DEBUG - GENERIC] First 10 lines:');
  for (let i = 0; i < Math.min(10, lines.length); i++) {
    console.log(`  Line ${i}: ${lines[i].substring(0, 100)}`);
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const dateMatch = line.match(datePattern);

    if (dateMatch) {
      console.log(`[PDF PROCESSOR DEBUG - GENERIC] Found date in line ${i}: ${dateMatch[0]}`);

      // Look for amount in the same line or next few lines
      for (let j = i; j < Math.min(i + 3, lines.length); j++) {
        const amountMatch = lines[j].match(amountPattern);
        if (amountMatch) {
          console.log(`[PDF PROCESSOR DEBUG - GENERIC] Found amount in line ${j}: ${amountMatch[0]}`);

          let amount = parseFloat(amountMatch[3].replace(/,/g, ''));

          if (amountMatch[1] === '-') {
            amount = -amount;
          }

          // Extract description (text between date and amount)
          const description = line.replace(dateMatch[0], '').replace(amountMatch[0], '').trim();

          if (description.length > 0) {
            console.log(`[PDF PROCESSOR DEBUG - GENERIC] Adding transaction: ${description} - ${amount}`);
            transactions.push({
              date: parseUKDate(dateMatch[0]),
              description,
              amount,
              balance: null, // Generic parser doesn't extract balance
              originalText: line
            });
          } else {
            console.log('[PDF PROCESSOR DEBUG - GENERIC] Skipping - no description found');
          }
          break;
        }
      }
    }
  }

  const filtered = transactions.filter(t =>
    t.date &&
    t.description &&
    t.amount !== null &&
    !isNaN(t.amount)
  );

  console.log(`[PDF PROCESSOR DEBUG - GENERIC] Raw transactions: ${transactions.length}, Filtered: ${filtered.length}`);

  return filtered;
}

/**
 * Parse UK date format (DD/MM/YYYY or DD/MM/YY)
 */
function parseUKDate(dateString) {
  const parts = dateString.split(/[\/\-]/);
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
    let year = parseInt(parts[2], 10);
    
    // Handle 2-digit years
    if (year < 100) {
      year += year < 50 ? 2000 : 1900;
    }
    
    return new Date(year, month, day);
  }
  
  return null;
}

module.exports = {
  parsePdfBuffer,
  identifyBankFromContent,
  extractTransactions,
  extractAllText
};