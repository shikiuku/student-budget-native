import { NextResponse } from 'next/server';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase'; // Firebase dbインスタンスをインポート

// GET: 支出リストの取得
export async function GET() {
  try {
    const expensesCol = collection(db, 'expenses');
    const expenseSnapshot = await getDocs(expensesCol);
    const expensesList = expenseSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json(expensesList);
  } catch (error: any) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json({ message: 'Error fetching expenses', error: error.message }, { status: 500 });
  }
}

// POST: 新規支出の追加
export async function POST(request: Request) {
  try {
    const newExpenseData = await request.json();
    // user_idは認証機能実装後に実際のユーザーIDに置き換える
    // 現時点では仮のIDを使用するか、認証済みユーザーのUIDを使用
    // 例: newExpenseData.user_id = 'placeholder_user_id';
    // または、認証済みユーザーのUIDを取得するロジックを追加
    // const user = await getAuth().currentUser;
    // if (user) newExpenseData.user_id = user.uid; else return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const docRef = await addDoc(collection(db, 'expenses'), newExpenseData);
    return NextResponse.json({ id: docRef.id, ...newExpenseData }, { status: 201 });
  } catch (error: any) {
    console.error('Error adding expense:', error);
    return NextResponse.json({ message: 'Error adding expense', error: error.message }, { status: 500 });
  }
}

// PUT: 特定の支出の更新 (IDはURLパスから取得)
export async function PUT(request: Request) {
  try {
    const { id, ...updatedFields } = await request.json();
    if (!id) {
      return NextResponse.json({ message: 'Expense ID is required' }, { status: 400 });
    }

    const expenseRef = doc(db, 'expenses', id);
    await updateDoc(expenseRef, updatedFields);
    return NextResponse.json({ id, ...updatedFields });
  } catch (error: any) {
    console.error('Error updating expense:', error);
    return NextResponse.json({ message: 'Error updating expense', error: error.message }, { status: 500 });
  }
}

// DELETE: 特定の支出の削除 (IDはURLパスから取得)
export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ message: 'Expense ID is required' }, { status: 400 });
    }

    const expenseRef = doc(db, 'expenses', id);
    await deleteDoc(expenseRef);
    return NextResponse.json({ message: 'Expense deleted' });
  } catch (error: any) {
    console.error('Error deleting expense:', error);
    return NextResponse.json({ message: 'Error deleting expense', error: error.message }, { status: 500 });
  }
}
