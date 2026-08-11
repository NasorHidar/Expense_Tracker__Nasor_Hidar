"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { formatCurrency, formatDate, getErrorMessage } from "@/lib/utils";
import toast from "react-hot-toast";
import {
  HiOutlineTrendingUp,
  HiOutlineTrendingDown,
  HiOutlineCash,
  HiOutlineArrowRight,
} from "react-icons/hi";

export default function DashboardPage() {
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [summaryRes, transactionsRes] = await Promise.all([
        api.get("/transactions/summary"),
        api.get("/transactions?limit=5&sortBy=transactionDate&sortOrder=desc"),
      ]);
      setSummary(summaryRes.data.data.summary);
      setRecentTransactions(transactionsRes.data.data.transactions);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="page-loading">
        <div className="spinner spinner-lg" />
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-description">Your financial overview at a glance</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-grid">
        <div className="card summary-card income">
          <div className="summary-card-header">
            <span className="summary-card-label">Total Income</span>
            <div className="summary-card-icon">
              <HiOutlineTrendingUp />
            </div>
          </div>
          <div className="summary-card-amount">
            {formatCurrency(summary.totalIncome)}
          </div>
        </div>

        <div className="card summary-card expense">
          <div className="summary-card-header">
            <span className="summary-card-label">Total Expenses</span>
            <div className="summary-card-icon">
              <HiOutlineTrendingDown />
            </div>
          </div>
          <div className="summary-card-amount">
            {formatCurrency(summary.totalExpense)}
          </div>
        </div>

        <div className="card summary-card balance">
          <div className="summary-card-header">
            <span className="summary-card-label">Balance</span>
            <div className="summary-card-icon">
              <HiOutlineCash />
            </div>
          </div>
          <div className="summary-card-amount">
            {formatCurrency(summary.balance)}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <div className="section-header">
          <h2 className="section-title">Recent Transactions</h2>
          <Link href="/transactions" className="btn btn-ghost btn-sm">
            View all <HiOutlineArrowRight />
          </Link>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">💸</div>
            <p className="empty-state-title">No transactions yet</p>
            <p className="empty-state-text">
              Start tracking your income and expenses by adding your first transaction.
            </p>
            <Link href="/transactions" className="btn btn-primary">
              Add Transaction
            </Link>
          </div>
        ) : (
          <div className="recent-list">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="recent-item">
                <div className="recent-item-left">
                  <div
                    className={`recent-item-icon ${transaction.type.toLowerCase()}`}
                  >
                    {transaction.type === "INCOME" ? (
                      <HiOutlineTrendingUp />
                    ) : (
                      <HiOutlineTrendingDown />
                    )}
                  </div>
                  <div className="recent-item-info">
                    <div className="recent-item-title">{transaction.title}</div>
                    <div className="recent-item-category">
                      {transaction.category?.name}
                    </div>
                  </div>
                </div>
                <div className="recent-item-right">
                  <div
                    className={`recent-item-amount ${
                      transaction.type === "INCOME"
                        ? "amount-income"
                        : "amount-expense"
                    }`}
                  >
                    {transaction.type === "INCOME" ? "+" : "-"}
                    {formatCurrency(Number(transaction.amount))}
                  </div>
                  <div className="recent-item-date">
                    {formatDate(transaction.transactionDate)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
