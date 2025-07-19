'use client';

import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function TestButtonPage() {
  const [clicked, setClicked] = useState(false);

  const handleClick = () => {
    setClicked(true);
    alert('テストボタンがクリックされました！');
  };

  return (
    <div className="container mx-auto p-4 text-center">
      <h1 className="text-2xl font-bold mb-4">テストボタンページ</h1>
      <p className="mb-4">このボタンをクリックして反応を確認してください。</p>
      <Button onClick={handleClick}>テストボタン</Button>
      {clicked && <p className="mt-4 text-lg text-green-600">ボタンがクリックされました！</p>}
    </div>
  );
}
