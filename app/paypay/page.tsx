'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function PayPayPage() {
  const [message, setMessage] = useState('');

  const handleClick = () => {
    setMessage('ボタンがクリックされました！');
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">PayPay連携</h1>
      <Button onClick={handleClick}>PayPay CSV連携</Button>
      {message && <p className="mt-4 text-lg text-green-600">{message}</p>}
    </div>
  );
}