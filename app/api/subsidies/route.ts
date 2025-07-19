import { NextResponse } from 'next/server';

const subsidies = [
  {
    id: '1',
    title: '高校生等奨学給付金',
    description: '高校生の教育費を支援する給付金制度',
    amount: '年額32,300円〜138,000円',
    deadline: '2024年7月31日',
    region: '全国',
    category: '教育',
    requirements: ['高校生', '住民税非課税世帯'],
    status: '申請可能',
  },
  {
    id: '2',
    title: '子育て世帯生活支援特別給付金',
    description: '18歳以下の子どもがいる世帯への給付金',
    amount: '児童1人あたり5万円',
    deadline: '2024年3月31日',
    region: '東京都',
    category: '生活支援',
    requirements: ['18歳以下', '住民税非課税世帯'],
    status: '受付終了',
  },
  {
    id: '3',
    title: '学習塾代助成',
    description: '中学3年生の学習塾費用を助成',
    amount: '月額2万円まで',
    deadline: '随時受付',
    region: '大阪府',
    category: '教育',
    requirements: ['中学3年生', '世帯年収400万円以下'],
    status: '申請可能',
  },
  {
    id: '4',
    title: '高校生通学費補助',
    description: '公共交通機関の通学定期代を補助',
    amount: '月額5,000円まで',
    deadline: '2024年4月30日',
    region: '神奈川県',
    category: '交通',
    requirements: ['高校生', '通学距離2km以上'],
    status: '申請可能',
  },
];

export async function GET() {
  return NextResponse.json(subsidies);
}
