import type { PayPayCsvRecord, ExpenseCategory } from './types';

// PayPay CSV parser
export class PayPayCsvParser {
  private static readonly REQUIRED_HEADERS = [
    '取引日',
    '出金金額（円）',
    '入金金額（円）',
    '取引内容',
    '取引先'
  ];

  static parseCSV(csvContent: string): PayPayCsvRecord[] {
    console.log('PayPayCSVParser - parseCSV called with content length:', csvContent.length);
    
    const lines = csvContent.trim().split('\n');
    console.log('PayPayCSVParser - lines count:', lines.length);
    
    if (lines.length < 2) {
      throw new Error('CSVファイルが空か、ヘッダー行がありません。');
    }

    // Parse header
    const headers = this.parseCSVLine(lines[0]);
    console.log('PayPayCSVParser - headers:', headers);
    this.validateHeaders(headers);

    // Parse data rows
    const records: PayPayCsvRecord[] = [];
    const errors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      try {
        const values = this.parseCSVLine(lines[i]);
        console.log(`PayPayCSVParser - row ${i + 1} values:`, values);
        const record = this.parseRecord(headers, values);
        console.log(`PayPayCSVParser - row ${i + 1} parsed record:`, record);
        
        // Include all records for display, but mark type
        records.push(record);
      } catch (error) {
        console.error(`PayPayCSVParser - row ${i + 1} error:`, error);
        errors.push(`行 ${i + 1}: ${(error as Error).message}`);
      }
    }

    console.log('PayPayCSVParser - final results - records:', records.length, 'errors:', errors.length);
    if (errors.length > 0) {
      console.log('PayPayCSVParser - errors:', errors);
    }

    if (errors.length > 0 && records.length === 0) {
      throw new Error(`CSVの解析でエラーが発生しました:\n${errors.join('\n')}`);
    }

    return records;
  }

  private static parseCSVLine(line: string): string[] {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // Escaped quote
          current += '"';
          i++; // Skip next quote
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // Field separator
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    // Add last field
    values.push(current.trim());
    
    return values;
  }

  private static validateHeaders(headers: string[]): void {
    const missingHeaders = this.REQUIRED_HEADERS.filter(
      required => !headers.some(header => header.includes(required))
    );

    if (missingHeaders.length > 0) {
      throw new Error(`必要なヘッダーが見つかりません: ${missingHeaders.join(', ')}`);
    }
  }

  private static parseRecord(headers: string[], values: string[]): PayPayCsvRecord {
    // Skip strict length check as CSV might have extra columns
    if (values.length < 5) {
      throw new Error(`値の数が不足しています。最低5列必要です。`);
    }

    const record: Record<string, string> = {};
    headers.forEach((header, index) => {
      record[header] = index < values.length ? values[index] || '' : '';
    });

    // Find column indices based on actual PayPay CSV format
    const dateIndex = headers.findIndex(h => h.includes('取引日'));
    const outAmountIndex = headers.findIndex(h => h.includes('出金金額'));
    const inAmountIndex = headers.findIndex(h => h.includes('入金金額'));
    const contentIndex = headers.findIndex(h => h.includes('取引内容'));
    const merchantIndex = headers.findIndex(h => h.includes('取引先'));

    // Validate required indices
    if (dateIndex === -1 || outAmountIndex === -1 || inAmountIndex === -1 || contentIndex === -1 || merchantIndex === -1) {
      throw new Error('必要な列が見つかりません');
    }

    // Parse date
    const dateTimeStr = values[dateIndex] || '';
    const dateTime = this.parseDateTime(dateTimeStr);

    // Parse amounts safely
    const outAmountStr = (values[outAmountIndex] || '-') === '-' ? '0' : (values[outAmountIndex] || '').replace(/[,¥円"]/g, '');
    const inAmountStr = (values[inAmountIndex] || '-') === '-' ? '0' : (values[inAmountIndex] || '').replace(/[,¥円"]/g, '');
    
    const outAmount = parseInt(outAmountStr) || 0;
    const inAmount = parseInt(inAmountStr) || 0;

    // Determine final amount (negative for expenses, positive for income)
    const amount = outAmount > 0 ? -outAmount : inAmount;

    // Determine transaction type
    const contentStr = values[contentIndex] || '';
    let transaction_type: PayPayCsvRecord['transaction_type'] = 'payment';
    
    if (contentStr.includes('チャージ') || contentStr.includes('受け取った金額') || inAmount > 0) {
      transaction_type = 'charge';
    } else if (contentStr.includes('返金') || contentStr.includes('キャンセル')) {
      transaction_type = 'refund';
    }

    const merchant = values[merchantIndex] || '';
    const description = `${contentStr} - ${merchant}`.trim();

    return {
      date: dateTime.date,
      time: dateTime.time,
      description,
      amount,
      balance: 0, // PayPay CSV doesn't include balance in this format
      transaction_type,
      merchant,
      category: this.guessCategory(description)
    };
  }

  private static parseDateTime(dateTimeStr: string): { date: string; time: string } {
    // Expected format: YYYY/MM/DD HH:mm:ss or YYYY-MM-DD HH:mm:ss
    const match = dateTimeStr.match(/(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})\s+(\d{1,2}):(\d{1,2}):(\d{1,2})/);
    
    if (!match) {
      throw new Error(`日時の解析に失敗しました: ${dateTimeStr}`);
    }

    const [, year, month, day, hour, minute, second] = match;
    
    const date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    const time = `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}:${second.padStart(2, '0')}`;

    return { date, time };
  }

  private static extractMerchant(description: string): string {
    // Try to extract merchant name from description
    // Common patterns in PayPay descriptions
    const patterns = [
      /(.+?)店/, // Store name ending with 店
      /(.+?)コンビニ/, // Convenience store
      /(.+?)スーパー/, // Supermarket
      /(.+?)レストラン/, // Restaurant
    ];

    for (const pattern of patterns) {
      const match = description.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }

    // Return first part of description if no pattern matches
    return description.split(/[\s\-\|]/)[0] || '';
  }

  private static guessCategory(description: string): string {
    const categoryKeywords = {
      '食費': ['セブン-イレブン', 'ファミリーマート', 'ローソン', 'スーパー', 'レストラン', '飲食', '食堂', 'カフェ', 'マクドナルド', 'パン', '弁当', 'コンビニ'],
      '交通費': ['駅', '電車', 'バス', 'タクシー', '地下鉄', 'JR', '私鉄', '切符', '定期', '交通'],
      '娯楽': ['映画', 'ゲーム', 'カラオケ', 'ボウリング', '遊園地', '水族館', '動物園', 'コンサート', 'アミューズメント'],
      '学用品': ['書店', '文房具', '本屋', '教科書', 'ノート', 'ペン', '参考書', '文具'],
      '衣類': ['服', '洋服', 'ファッション', 'シューズ', '靴', 'バッグ', 'アパレル', '衣料'],
      '医療': ['病院', '薬局', 'クリニック', '医院', 'ドラッグストア', '薬'],
      '日用品': ['ドラッグストア', 'ホームセンター', '雑貨', '生活用品']
    };

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(keyword => description.includes(keyword))) {
        return category;
      }
    }

    return 'その他';
  }

  // Convert PayPay records to expense records
  static convertToExpenses(
    records: PayPayCsvRecord[], 
    categories: ExpenseCategory[],
    userId: string
  ): Array<{
    amount: number;
    category_id: string;
    description: string;
    date: string;
    source: 'paypay_csv';
    original_data: PayPayCsvRecord;
  }> {
    // Filter only expense records (negative amounts indicating money spent)
    const expenseRecords = records.filter(record => record.amount < 0);
    
    return expenseRecords.map(record => {
      // Find matching category
      let category = categories.find(cat => cat.name === record.category);
      
      // Default to "その他" if category not found
      if (!category) {
        category = categories.find(cat => cat.name === 'その他') || categories.find(cat => cat.name.includes('その他')) || categories[0];
      }

      if (!category) {
        throw new Error('デフォルトカテゴリが見つかりません。データベースにカテゴリが登録されていない可能性があります。');
      }

      return {
        amount: Math.abs(record.amount), // Convert to positive number for expense tracking
        category_id: category.id,
        description: record.description || record.merchant || '詳細不明',
        date: record.date,
        source: 'paypay_csv' as const,
        original_data: record
      };
    });
  }
}