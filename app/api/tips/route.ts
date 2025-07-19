import { NextResponse } from 'next/server';

const tips = [
  {
    id: '1',
    title: 'お弁当作りで月3,000円節約！',
    description: 'コンビニ弁当を週3回お弁当に変えるだけで大幅節約。簡単レシピも紹介！',
    category: '食費',
    difficulty: '簡単',
    savings: '月3,000円',
    likes: 124,
    bookmarked: true,
  },
  {
    id: '2',
    title: '学割を最大活用する方法',
    description: '映画館、カラオケ、交通機関など学割が使える場所をまとめました。',
    category: '娯楽',
    difficulty: '簡単',
    savings: '月2,000円',
    likes: 89,
    bookmarked: false,
  },
  {
    id: '3',
    title: 'フリマアプリで不用品を現金化',
    description: '使わなくなった教科書や服をフリマアプリで売って小遣い稼ぎ！',
    category: '収入',
    difficulty: '普通',
    savings: '月5,000円',
    likes: 156,
    bookmarked: true,
  },
  {
    id: '4',
    title: '自転車通学で交通費ゼロ',
    description: '電車やバス代を節約。健康にも良くて一石二鳥！雨の日対策も解説。',
    category: '交通費',
    difficulty: '普通',
    savings: '月4,000円',
    likes: 67,
    bookmarked: false,
  },
];

export async function GET() {
  return NextResponse.json(tips);
}
