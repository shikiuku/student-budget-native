import { NextRequest, NextResponse } from 'next/server'
import { expenseCategoryService } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const result = await expenseCategoryService.getCategories()

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json(result.data)
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}