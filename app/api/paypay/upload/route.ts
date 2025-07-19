import { NextResponse } from 'next/server';
import Papa from 'papaparse';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase'; // Firebase dbインスタンスをインポート

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
        complete: async (results) => {
          const expensesToSave = results.data.map((row: any) => {
            // Assuming CSV has '日付', '金額', '内容' columns
            // You might need to adjust column names based on actual PayPay CSV format
            const [year, month, day] = (row['日付'] || '').split('/');
            const formattedDate = year && month && day ? `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}` : '';

            return {
              amount: parseFloat(row['金額']),
              category: '未分類', // Default category, can be improved later
              date: formattedDate,
              description: row['内容'],
              source: 'paypay',
              user_id: 'fixed_test_user_id', // 一時的に固定のユーザーIDを使用
            };
          }).filter((expense: any) => !isNaN(expense.amount) && expense.date);

          console.log('Expenses to save:', expensesToSave); // デバッグ用にログ出力

          try {
            const savePromises = expensesToSave.map(async (expense: any) => {
              await addDoc(collection(db, 'expenses'), expense);
            });
            await Promise.all(savePromises);
            resolve(NextResponse.json({ message: 'File uploaded, parsed, and expenses saved to Firebase successfully' }));
          } catch (saveError: any) {
            console.error('Error saving expenses to Firebase:', saveError);
            resolve(NextResponse.json({ message: 'Error saving expenses to Firebase', error: saveError.message }, { status: 500 }));
          }
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
