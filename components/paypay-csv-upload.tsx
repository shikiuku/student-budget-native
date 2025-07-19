
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface PayPayCsvUploadProps {
  onUploadSuccess?: () => void;
}

export default function PayPayCsvUpload({ onUploadSuccess }: PayPayCsvUploadProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();

      reader.onabort = () => console.log('file reading was aborted');
      reader.onerror = () => console.log('file reading has failed');
      reader.onload = async () => {
        const csvText = reader.result as string;
        Papa.parse(csvText, {
          header: true,
          complete: async (results) => {
            const expensesToSave = results.data.map((row: any) => {
              const [year, month, day] = (row['日付'] || '').split('/');
              const formattedDate = year && month && day ? `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}` : '';

              return {
                amount: parseFloat(row['金額']),
                category: '未分類', // Default category, can be improved later
                date: formattedDate,
                description: row['内容'],
                source: 'paypay',
                user_id: 'placeholder_user_id', // TODO: Replace with actual authenticated user ID
              };
            }).filter((expense: any) => !isNaN(expense.amount) && expense.date);

            try {
              const savePromises = expensesToSave.map(async (expense: any) => {
                await addDoc(collection(db, 'expenses'), expense);
              });
              await Promise.all(savePromises);
              if (onUploadSuccess) {
                onUploadSuccess();
              }
            } catch (saveError: any) {
              console.error('Error saving expenses to Firebase:', saveError);
              // TODO: Show error message to user
            }
          },
          error: (error: any) => {
            console.error('CSV parsing error:', error);
            // TODO: Show error message to user
          },
        });
      };
      reader.readAsText(file);
    });
  }, [onUploadSuccess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
    },
  });

  return (
    <div
      {...getRootProps()}
      className="border-2 border-dashed border-gray-300 p-6 rounded-lg text-center cursor-pointer hover:border-gray-400"
    >
      <Input {...getInputProps()} />
      {isDragActive ? (
        <p>ここにファイルをドロップしてください...</p>
      ) : (
        <p>PayPayのCSVファイルをドラッグ＆ドロップするか、クリックして選択してください。</p>
      )}
      <Button className="mt-4">ファイルを選択</Button>
    </div>
  );
}
