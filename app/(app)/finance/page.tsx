import { createClient } from "@/lib/supabase/server"
import { FinanceContent } from "@/components/finance-content"
import { mockTransactions, mockBudgets } from "@/lib/mock-data"

export default async function FinancePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="p-6 lg:p-8">
        <FinanceContent initialTransactions={mockTransactions} initialBudgets={mockBudgets} isGuest />
      </div>
    )
  }

  const [{ data: txData }, { data: budgetData }] = await Promise.all([
    supabase
      .from("transactions")
      .select("*")
      .order("transaction_date", { ascending: false })
      .order("created_at", { ascending: false }),
    supabase
      .from("budgets")
      .select("*")
      .order("budget_month", { ascending: false }),
  ])

  const transactions = txData ?? []
  const budgets = budgetData ?? []
  const hasNoData = transactions.length === 0 && budgets.length === 0

  return (
    <div className="p-6 lg:p-8">
      <FinanceContent
        initialTransactions={hasNoData ? mockTransactions : transactions}
        initialBudgets={hasNoData ? mockBudgets : budgets}
        showingMockData={hasNoData}
      />
    </div>
  )
}
