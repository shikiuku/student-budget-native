'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import PayPayCsvUpload from '@/components/paypay-csv-upload';
import { useToast } from '@/components/ui/use-toast'; // useToastをインポート

export default function PayPayPage() {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleUploadSuccess = () => {
    setIsOpen(false); // ダイアログを閉じる
    toast({
      title: "アップロード完了",
      description: "PayPayの支出履歴が正常に記録されました。",
    });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">PayPay連携</h1>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button>PayPay CSV連携</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>PayPay CSVファイルをアップロード</DialogTitle>
          </DialogHeader>
          <PayPayCsvUpload onUploadSuccess={handleUploadSuccess} />
        </DialogContent>
      </Dialog>
    </div>
  );
}