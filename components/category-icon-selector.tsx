"use client"

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Settings2, Check } from "lucide-react"
import { CATEGORY_ICON_OPTIONS, getCategoryIcon } from '@/lib/category-icons'
import { userProfileService } from '@/lib/database'
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"

interface CategoryIconSelectorProps {
  categoryName: string
  currentIcon?: string
  userCategoryIcons?: Record<string, string>
  onIconChanged?: (categoryName: string, newIcon: string) => void
}

export function CategoryIconSelector({ categoryName, currentIcon, userCategoryIcons, onIconChanged }: CategoryIconSelectorProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [selectedIcon, setSelectedIcon] = useState(currentIcon || '')

  const availableIcons = CATEGORY_ICON_OPTIONS[categoryName] || CATEGORY_ICON_OPTIONS['その他']
  const currentIconComponent = getCategoryIcon(categoryName, userCategoryIcons)
  
  const handleIconSelect = (iconName: string) => {
    setSelectedIcon(iconName)
  }

  const handleSave = async () => {
    if (!selectedIcon || !user) return

    setSaving(true)
    try {
      const result = await userProfileService.updateCategoryIcon(user.id, categoryName, selectedIcon)
      
      if (result.success) {
        toast({
          title: "アイコンを更新しました",
          description: `${categoryName}のアイコンを変更しました`,
          variant: "success",
        })
        
        if (onIconChanged) {
          onIconChanged(categoryName, selectedIcon)
        }
        
        setIsOpen(false)
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast({
        title: "更新エラー",
        description: (error as Error).message,
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0 hover:bg-gray-100"
          title={`${categoryName}のアイコンを変更`}
        >
          <Settings2 className="h-4 w-4 text-gray-500" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px] bg-white border-gray-200">
        <DialogHeader>
          <DialogTitle className="text-black flex items-center gap-2">
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ 
                backgroundColor: getCategoryBgColor(categoryName),
              }}
            >
              {React.createElement(currentIconComponent, { 
                className: "h-4 w-4",
                style: { color: getCategoryIconColor(categoryName) }
              })}
            </div>
            {categoryName}のアイコン設定
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="text-sm text-gray-600">
            使用するアイコンを選択してください
          </div>
          
          <div className="grid grid-cols-4 gap-3">
            {availableIcons.map((option) => {
              const IconComponent = option.icon
              const isSelected = selectedIcon === option.name
              const isCurrent = currentIcon === option.name
              
              return (
                <button
                  key={option.name}
                  onClick={() => handleIconSelect(option.name)}
                  className={`
                    relative border-2 rounded-lg p-4 text-center cursor-pointer transition-all hover:shadow-sm
                    ${isSelected 
                      ? 'border-blue-300 bg-blue-50' 
                      : 'border-gray-200 hover:border-blue-200'
                    }
                  `}
                >
                  <div 
                    className="w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center"
                    style={{ 
                      backgroundColor: getCategoryBgColor(categoryName),
                    }}
                  >
                    <IconComponent 
                      className="h-5 w-5" 
                      style={{ color: getCategoryIconColor(categoryName) }}
                    />
                  </div>
                  <div className="text-xs text-gray-700 font-medium">
                    {option.label}
                  </div>
                  
                  {isCurrent && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}
                  
                  {isSelected && !isCurrent && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              キャンセル
            </Button>
            <Button
              onClick={handleSave}
              disabled={!selectedIcon || selectedIcon === currentIcon || saving}
              className="bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50"
            >
              {saving ? '保存中...' : '保存'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// スタイルガイドの色を取得する関数（統一）
const getCategoryBgColor = (categoryName: string): string => {
  switch (categoryName) {
    case '食費': return '#FFF3E0'
    case '交通費': return '#E0F8F8'
    case '娯楽・趣味': return '#FFF9C4'
    case '教材・書籍': return '#E8F5E8'
    case '衣類・雑貨': return '#F8E8E8'
    case '通信費': return '#F0EDFF'
    case 'その他': return '#F3F4F6'
    default: return '#F3F4F6'
  }
}

const getCategoryIconColor = (categoryName: string): string => {
  switch (categoryName) {
    case '食費': return '#FF6B35'
    case '交通費': return '#4ECDC4'
    case '娯楽・趣味': return '#FFD23F'
    case '教材・書籍': return '#6A994E'
    case '衣類・雑貨': return '#BC4749'
    case '通信費': return '#9C88FF'
    case 'その他': return '#6B7280'
    default: return '#6B7280'
  }
}