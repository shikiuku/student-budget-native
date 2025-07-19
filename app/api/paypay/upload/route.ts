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
          // TODO: Process the parsed data and save to expenses
          console.log('Parsed PayPay CSV data:', results.data);
          resolve(NextResponse.json({ message: 'File uploaded and parsed successfully', data: results.data }));
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
