
'use client';

import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function PayPayCsvUpload() {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();

      reader.onabort = () => console.log('file reading was aborted');
      reader.onerror = () => console.log('file reading has failed');
      reader.onload = () => {
        const csvText = reader.result as string;
        Papa.parse(csvText, {
          header: true,
          complete: (results) => {
            console.log('Parsed CSV data:', results.data);
            // TODO: Process the parsed data
          },
          error: (error) => {
            console.error('CSV parsing error:', error);
          },
        });
      };
      reader.readAsText(file);
    });
  }, []);

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
