import { NextRequest, NextResponse } from 'next/server'
import { expenseService } from '@/lib/database'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit')
    const year = searchParams.get('year')
    const month = searchParams.get('month')

    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let result
    if (year && month) {
      result = await expenseService.getExpensesByMonth(
        user.id, 
        parseInt(year), 
        parseInt(month)
      )
    } else {
      result = await expenseService.getExpenses(
        user.id, 
        limit ? parseInt(limit) : undefined
      )
    }

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

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { category_id, amount, description, expense_date, payment_method, tags } = body

    if (!category_id || !amount) {
      return NextResponse.json(
        { error: 'Category ID and amount are required' }, 
        { status: 400 }
      )
    }

    const result = await expenseService.createExpense(user.id, {
      category_id,
      amount,
      description,
      expense_date,
      payment_method,
      tags
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json(result.data, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}