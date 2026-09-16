import FinanceTransaction from "../models/FinanceTransaction.js";

export async function getFinanceInsights() {
  const transactions = await FinanceTransaction.find()
    .sort({ transactionDate: -1 })
    .lean();

  const income = transactions
    .filter((transaction) => transaction.type === "Income")
    .reduce(
      (total, transaction) =>
        total + transaction.amount,
      0
    );

  const expenses = transactions
    .filter((transaction) => transaction.type === "Expense")
    .reduce(
      (total, transaction) =>
        total + transaction.amount,
      0
    );

  const netCashFlow = income - expenses;

  const pendingPayments = transactions
    .filter(
      (transaction) =>
        transaction.paymentStatus !== "Paid"
    )
    .reduce(
      (total, transaction) =>
        total + transaction.amount,
      0
    );

  const expensesByCategory = new Map<
    string,
    number
  >();

  for (const transaction of transactions) {
    if (transaction.type !== "Expense") {
      continue;
    }

    const category = transaction.category;

    expensesByCategory.set(
      category,
      (expensesByCategory.get(category) || 0) +
        transaction.amount
    );
  }

  const categoryBreakdown = Array.from(
    expensesByCategory.entries()
  )
    .map(([category, amount]) => ({
      category,
      amount,
    }))
    .sort((a, b) => b.amount - a.amount);

  return {
    totalTransactions: transactions.length,
    income,
    expenses,
    netCashFlow,
    pendingPayments,
    categoryBreakdown,
    recentTransactions: transactions.slice(0, 10),
  };
}
