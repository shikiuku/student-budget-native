import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import PayPayCsvUpload from '@/components/paypay-csv-upload';
import { useToast } from '@/components/ui/use-toast';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/components/auth-provider';

interface Expense {
  id: string;
  amount: number;
  category: string;
  date: string;
  description: string;
  source: string;
  user_id: string;
}

export default function PayPayPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const fetchExpenses = async () => {
    if (!user) return; // ユーザーがいない場合は何もしない

    try {
      const expensesCollectionRef = collection(db, 'expenses');
      const q = query(
        expensesCollectionRef,
        where('user_id', '==', user.uid),
        orderBy('date', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const fetchedExpenses: Expense[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data() as Omit<Expense, 'id'>
      }));
      setExpenses(fetchedExpenses);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      toast({
        title: 'データ取得エラー',
        description: '支出データの取得中にエラーが発生しました。',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchExpenses();
    }
  }, [user]); // userが変更されたときにデータを再取得

  const handleUploadSuccess = () => {
    setIsOpen(false);
    toast({
      title: "アップロード完了",
      description: "PayPayの支出履歴が正常に記録されました。",
    });
    fetchExpenses(); // アップロード成功後にデータを再取得
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">読み込み中...</div>; // ローディング表示
  }

  if (!user) {
    return null; // ログインページへリダイレクトされるため、ここでは何も表示しない
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">PayPay連携</h1>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button className="mb-4">PayPay CSV連携</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>PayPay CSVファイルをアップロード</DialogTitle>
          </DialogHeader>
          <PayPayCsvUpload onUploadSuccess={handleUploadSuccess} />
        </DialogContent>
      </Dialog>

      <h2 className="text-xl font-semibold mt-8 mb-4">最近のPayPay支出</h2>
      {expenses.length === 0 ? (
        <p>まだPayPayの支出データがありません。</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {expenses.map((expense) => (
            <Card key={expense.id}>
              <CardHeader>
                <CardTitle>{expense.description}</CardTitle>
              </CardHeader>
              <CardContent>
                <p><strong>金額:</strong> ¥{expense.amount.toLocaleString()}</p>
                <p><strong>日付:</strong> {expense.date}</p>
                <p><strong>カテゴリ:</strong> {expense.category}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}