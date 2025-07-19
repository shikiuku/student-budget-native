
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { auth } from '@/lib/firebase'; // Firebase authをインポート

interface PayPayCsvUploadProps {
  onUploadSuccess?: () => void;
}

export default function PayPayCsvUpload({ onUploadSuccess }: PayPayCsvUploadProps) {
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    console.log('onDrop called', acceptedFiles);
    if (acceptedFiles.length === 0) {
      console.log('No files were accepted. Check file type or accept settings.');
    }
    const file = acceptedFiles[0];
    if (!file) {
      return;
    }

    const user = auth.currentUser; // 現在のユーザーを取得
    if (!user) {
      toast({
        title: '認証エラー',
        description: 'ユーザーが認証されていません。ログインしてください。',
        variant: 'destructive',
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', user.uid); // ユーザーIDをFormDataに追加

    try {
      const response = await fetch('/api/paypay/upload', {
        method: 'POST',
        body: formData,
      });

      console.log('Fetch response:', response);
      if (response.ok) {
        toast({
          title: 'アップロード成功',
          description: 'PayPayの支出データが正常に保存されました。',
        });
        if (onUploadSuccess) {
          onUploadSuccess();
        }
      } else {
        const errorData = await response.json();
        toast({
          title: 'アップロード失敗',
          description: `データの保存中にエラーが発生しました: ${errorData.message || response.statusText}`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: 'アップロード失敗',
        description: 'ファイルのアップロード中に予期せぬエラーが発生しました。',
        variant: 'destructive',
      });
    }
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
