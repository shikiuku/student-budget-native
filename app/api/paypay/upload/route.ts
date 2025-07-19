import { NextResponse } from 'next/server';
import Papa from 'papaparse';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ message: 'No file uploaded' }, { status: 400 });
    }

    const fileContent = await file.text();

    return new Promise((resolve) => {
      Papa.parse(fileContent, {
        header: true,
        complete: (results) => {
          const expensesToSave = results.data.map((row: any) => ({
            // Assuming CSV has '日付', '金額', '内容' columns
            // You might need to adjust column names based on actual PayPay CSV format
            amount: parseFloat(row['金額']),
            category: '未分類', // Default category, can be improved later
            date: row['日付'], // Assuming YYYY/MM/DD format, will need conversion to YYYY-MM-DD for consistency
            description: row['内容'],
            source: 'paypay',
          })).filter((expense: any) => !isNaN(expense.amount) && expense.date); // Filter out invalid entries

          // Send each parsed expense to the /api/expenses POST endpoint
          const savePromises = expensesToSave.map(async (expense: any) => {
            // Convert date from YYYY/MM/DD to YYYY-MM-DD
            const [year, month, day] = expense.date.split('/');
            expense.date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

            const response = await fetch('http://localhost:3000/api/expenses', { // Use full URL for API route
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(expense),
            });
            return response.json();
          });

          Promise.all(savePromises)
            .then(() => {
              resolve(NextResponse.json({ message: 'File uploaded, parsed, and expenses saved successfully' }));
            })
            .catch((saveError) => {
              console.error('Error saving expenses:', saveError);
              resolve(NextResponse.json({ message: 'Error saving expenses', error: saveError.message }, { status: 500 }));
            });
        },
        error: (error: any) => {
          console.error('CSV parsing error:', error);
          resolve(NextResponse.json({ message: 'Error parsing CSV', error: error.message }, { status: 500 }));
        },
      });
    });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
  }
}
