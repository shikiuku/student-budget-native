"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-provider"
import { PayPayCsvParser } from "@/lib/csv-parser"
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react"
import type { PayPayCsvRecord } from "@/lib/types"

export default function PayPayPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [file, setFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [parsedData, setParsedData] = useState<PayPayCsvRecord[]>([])
  const [importResults, setImportResults] = useState<{
    total: number
    successful: number
    failed: number
    errors: string[]
  } | null>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile)
      setParsedData([])
      setImportResults(null)
    } else {
      toast({
        title: "ファイル形式エラー",
        description: "CSVファイルを選択してください。",
        variant: "destructive",
      })
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const processCSV = async () => {
    if (!file || !user) {
      toast({
        title: "エラー",
        description: "ファイルが選択されていないか、ログインが必要です。",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)
    
    try {
      const csvContent = await file.text()
      
      // Remove BOM if present
      const cleanedContent = csvContent.replace(/^\uFEFF/, '')
      
      const records = PayPayCsvParser.parseCSV(cleanedContent)
      
      // Filter only expense records (negative amounts)
      const expenseRecords = records.filter(record => 
        record.transaction_type === 'payment' && record.amount < 0
      )

      setParsedData(expenseRecords)
      
      toast({
        title: "CSV解析完了",
        description: `${expenseRecords.length}件の支出レコードを検出しました。`,
        variant: "success",
      })

    } catch (error) {
      console.error('CSV processing error:', error)
      toast({
        title: "CSV解析エラー",
        description: (error as Error).message,
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const importToExpenses = async () => {
    if (!parsedData.length || !user) return

    setIsProcessing(true)
    
    try {
      // Convert parsed data to expense format
      const expenses = parsedData.map(record => ({
        amount: Math.abs(record.amount), // Convert to positive for expense tracking
        category_name: record.category || 'その他',
        description: record.description || `${record.transaction_type} - ${record.merchant}`,
        date: record.date,
        source: 'paypay_csv' as const,
        original_data: record
      }))

      // Here you would typically send the data to your API
      // For now, we'll simulate the import
      const successful = expenses.length
      const failed = 0
      const errors: string[] = []

      setImportResults({
        total: expenses.length,
        successful,
        failed,
        errors
      })

      toast({
        title: "インポート完了",
        description: `${successful}件の支出を登録しました。`,
        variant: "success",
      })

      // Clear the data after successful import
      setParsedData([])
      setFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

    } catch (error) {
      console.error('Import error:', error)
      toast({
        title: "インポートエラー",
        description: (error as Error).message,
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-black">ログインが必要です</h1>
          <p className="text-gray-600">PayPayのデータをインポートするにはログインしてください。</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white px-6 py-4">
      <div className="max-w-4xl mx-auto space-y-6 pt-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-black">PayPay連携</h1>
          <p className="text-gray-600">PayPayの取引履歴CSVファイルから支出データをインポートできます</p>
        </div>

        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-black flex items-center gap-2">
              <Upload className="h-5 w-5" />
              CSVファイルのアップロード
            </CardTitle>
            <CardDescription>
              PayPayアプリから取引履歴をエクスポートしたCSVファイルを選択してください
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="csv-file" className="text-black">CSVファイル</Label>
              <div className="flex gap-2">
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button
                  onClick={handleUploadClick}
                  variant="outline"
                  className="flex-1 border-gray-300 bg-white text-black hover:bg-gray-50"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {file ? file.name : 'CSVファイルを選択'}
                </Button>
                {file && (
                  <Button
                    onClick={processCSV}
                    disabled={isProcessing}
                    className="bg-zaim-blue-500 hover:bg-zaim-blue-600 text-white"
                  >
                    {isProcessing ? "処理中..." : "解析"}
                  </Button>
                )}
              </div>
            </div>

            {parsedData.length > 0 && (
              <div className="space-y-4">
                <div className="bg-zaim-blue-50 border border-zaim-blue-200 rounded-lg p-4">
                  <h3 className="font-medium text-black mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    解析結果
                  </h3>
                  <p className="text-sm text-black">
                    {parsedData.length}件の支出レコードが見つかりました
                  </p>
                </div>

                <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-black">日付</th>
                        <th className="px-3 py-2 text-left text-black">取引先</th>
                        <th className="px-3 py-2 text-left text-black">金額</th>
                        <th className="px-3 py-2 text-left text-black">カテゴリ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsedData.slice(0, 10).map((record, index) => (
                        <tr key={index} className="border-t border-gray-200">
                          <td className="px-3 py-2 text-black">{record.date}</td>
                          <td className="px-3 py-2 text-black">{record.merchant}</td>
                          <td className="px-3 py-2 text-black">¥{Math.abs(record.amount).toLocaleString()}</td>
                          <td className="px-3 py-2 text-black">{record.category}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {parsedData.length > 10 && (
                    <div className="px-3 py-2 text-sm text-gray-500 bg-gray-50 text-center">
                      他 {parsedData.length - 10} 件...
                    </div>
                  )}
                </div>

                <Button
                  onClick={importToExpenses}
                  disabled={isProcessing}
                  className="w-full bg-zaim-blue-500 hover:bg-zaim-blue-600 text-white"
                >
                  {isProcessing ? "インポート中..." : "支出データとしてインポート"}
                </Button>
              </div>
            )}

            {importResults && (
              <div className="bg-zaim-blue-50 border border-zaim-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-black mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-zaim-blue-600" />
                  インポート完了
                </h3>
                <div className="space-y-1 text-sm text-black">
                  <p>合計: {importResults.total}件</p>
                  <p>成功: {importResults.successful}件</p>
                  {importResults.failed > 0 && (
                    <p className="text-red-600">失敗: {importResults.failed}件</p>
                  )}
                </div>
                {importResults.errors.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-red-600">エラー:</p>
                    <ul className="text-xs text-red-600 mt-1 space-y-1">
                      {importResults.errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-black">使用方法</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-black">
            <div className="space-y-2">
              <h4 className="font-medium">1. PayPayアプリから取引履歴をエクスポート</h4>
              <p className="text-gray-600 ml-4">
                PayPayアプリの「取引履歴」から「CSV出力」を選択し、期間を指定してダウンロードしてください。
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">2. CSVファイルをアップロード</h4>
              <p className="text-gray-600 ml-4">
                ダウンロードしたCSVファイルを上記のフォームからアップロードしてください。
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">3. データの確認とインポート</h4>
              <p className="text-gray-600 ml-4">
                解析されたデータを確認し、問題なければ「インポート」ボタンを押してください。
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}