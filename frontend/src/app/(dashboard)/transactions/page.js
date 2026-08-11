"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import { formatCurrency, formatDate, toInputDate, getErrorMessage } from "@/lib/utils";
import toast from "react-hot-toast";
import {
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineSearch,
  HiOutlineX,
  HiOutlineTrendingUp,
  HiOutlineTrendingDown,
} from "react-icons/hi";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 15,
    totalCount: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    type: "",
    categoryId: "",
    startDate: "",
    endDate: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    type: "EXPENSE",
    categoryId: "",
    transactionDate: new Date().toISOString().split("T")[0],
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch transactions with filters
  const fetchTransactions = useCallback(
    async (page = 1) => {
      try {
        const params = new URLSearchParams();
        params.append("page", page);
        params.append("limit", pagination.limit);
        params.append("sortBy", "transactionDate");
        params.append("sortOrder", "desc");

        if (filters.type) params.append("type", filters.type);
        if (filters.categoryId) params.append("categoryId", filters.categoryId);
        if (filters.startDate) params.append("startDate", filters.startDate);
        if (filters.endDate) params.append("endDate", filters.endDate);

        const response = await api.get(`/transactions?${params.toString()}`);
        setTransactions(response.data.data.transactions);
        setPagination(response.data.data.pagination);
      } catch (error) {
        toast.error(getErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    },
    [filters, pagination.limit]
  );

  // Fetch categories for filter dropdown and form
  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories");
      setCategories(response.data.data.categories);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Filter handlers
  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({ type: "", categoryId: "", startDate: "", endDate: "" });
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== "");

  // Modal handlers
  const openCreateModal = () => {
    setEditingTransaction(null);
    setFormData({
      title: "",
      amount: "",
      type: "EXPENSE",
      categoryId: "",
      transactionDate: new Date().toISOString().split("T")[0],
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      title: transaction.title,
      amount: Number(transaction.amount).toString(),
      type: transaction.type,
      categoryId: transaction.categoryId,
      transactionDate: toInputDate(transaction.transactionDate),
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTransaction(null);
    setFormErrors({});
  };

  // Form validation
  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = "Title is required";
    if (!formData.amount || Number(formData.amount) <= 0)
      errors.amount = "Amount must be positive";
    if (!formData.categoryId) errors.categoryId = "Category is required";
    if (!formData.transactionDate) errors.transactionDate = "Date is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Create or update transaction
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount),
        transactionDate: formData.transactionDate,
      };

      if (editingTransaction) {
        await api.put(`/transactions/${editingTransaction.id}`, payload);
        toast.success("Transaction updated");
      } else {
        await api.post("/transactions", payload);
        toast.success("Transaction created");
      }

      closeModal();
      fetchTransactions(pagination.page);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete transaction
  const handleDelete = async (id) => {
    try {
      await api.delete(`/transactions/${id}`);
      toast.success("Transaction deleted");
      setDeleteConfirm(null);
      fetchTransactions(pagination.page);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  // Get categories filtered by selected type for the form
  const filteredFormCategories = categories.filter(
    (cat) => cat.type === formData.type
  );

  if (isLoading) {
    return (
      <div className="page-loading">
        <div className="spinner spinner-lg" />
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Transactions</h1>
          <p className="page-description">Manage your income and expenses</p>
        </div>
        <button className="btn btn-primary" onClick={openCreateModal}>
          <HiOutlinePlus /> Add Transaction
        </button>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="filter-group">
          <label className="filter-label">Type</label>
          <select
            className="form-input"
            value={filters.type}
            onChange={(e) => handleFilterChange("type", e.target.value)}
          >
            <option value="">All Types</option>
            <option value="INCOME">Income</option>
            <option value="EXPENSE">Expense</option>
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Category</label>
          <select
            className="form-input"
            value={filters.categoryId}
            onChange={(e) => handleFilterChange("categoryId", e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name} ({cat.type})
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Start Date</label>
          <input
            type="date"
            className="form-input"
            value={filters.startDate}
            onChange={(e) => handleFilterChange("startDate", e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label className="filter-label">End Date</label>
          <input
            type="date"
            className="form-input"
            value={filters.endDate}
            onChange={(e) => handleFilterChange("endDate", e.target.value)}
          />
        </div>

        {hasActiveFilters && (
          <div className="filter-actions">
            <button className="btn btn-ghost btn-sm" onClick={clearFilters}>
              <HiOutlineX /> Clear
            </button>
          </div>
        )}
      </div>

      {/* Transactions Table */}
      {transactions.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">
              <HiOutlineSearch />
            </div>
            <p className="empty-state-title">No transactions found</p>
            <p className="empty-state-text">
              {hasActiveFilters
                ? "Try adjusting your filters to see more results."
                : "Start tracking by adding your first transaction."}
            </p>
            {!hasActiveFilters && (
              <button className="btn btn-primary" onClick={openCreateModal}>
                <HiOutlinePlus /> Add Transaction
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Transaction</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Type</th>
                  <th style={{ textAlign: "right" }}>Amount</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>
                      <div className="table-title">{transaction.title}</div>
                    </td>
                    <td>{transaction.category?.name}</td>
                    <td>{formatDate(transaction.transactionDate)}</td>
                    <td>
                      <span
                        className={`badge badge-${transaction.type.toLowerCase()}`}
                      >
                        {transaction.type === "INCOME" ? (
                          <HiOutlineTrendingUp />
                        ) : (
                          <HiOutlineTrendingDown />
                        )}
                        {transaction.type}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <span
                        className={`amount ${
                          transaction.type === "INCOME"
                            ? "amount-income"
                            : "amount-expense"
                        }`}
                      >
                        {transaction.type === "INCOME" ? "+" : "-"}
                        {formatCurrency(Number(transaction.amount))}
                      </span>
                    </td>
                    <td>
                      <div className="actions-cell">
                        <button
                          className="btn btn-ghost btn-icon btn-sm"
                          onClick={() => openEditModal(transaction)}
                          title="Edit"
                        >
                          <HiOutlinePencil />
                        </button>
                        <button
                          className="btn btn-ghost btn-icon btn-sm"
                          onClick={() => setDeleteConfirm(transaction.id)}
                          title="Delete"
                          style={{ color: "var(--accent-expense)" }}
                        >
                          <HiOutlineTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="pagination">
              <span className="pagination-info">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                {Math.min(
                  pagination.page * pagination.limit,
                  pagination.totalCount
                )}{" "}
                of {pagination.totalCount} transactions
              </span>
              <div className="pagination-buttons">
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => fetchTransactions(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                >
                  Previous
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => fetchTransactions(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingTransaction ? "Edit Transaction" : "Add Transaction"}
              </h3>
              <button className="modal-close" onClick={closeModal}>
                <HiOutlineX />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="auth-form">
                  <div className="form-group">
                    <label className="form-label">Title</label>
                    <input
                      type="text"
                      className={`form-input ${formErrors.title ? "error" : ""}`}
                      placeholder="e.g., Monthly salary"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, title: e.target.value }))
                      }
                    />
                    {formErrors.title && (
                      <span className="form-error">{formErrors.title}</span>
                    )}
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Amount</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className={`form-input ${formErrors.amount ? "error" : ""}`}
                        placeholder="0.00"
                        value={formData.amount}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            amount: e.target.value,
                          }))
                        }
                      />
                      {formErrors.amount && (
                        <span className="form-error">{formErrors.amount}</span>
                      )}
                    </div>

                    <div className="form-group">
                      <label className="form-label">Type</label>
                      <select
                        className="form-input"
                        value={formData.type}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            type: e.target.value,
                            categoryId: "",
                          }))
                        }
                      >
                        <option value="EXPENSE">Expense</option>
                        <option value="INCOME">Income</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Category</label>
                      <select
                        className={`form-input ${
                          formErrors.categoryId ? "error" : ""
                        }`}
                        value={formData.categoryId}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            categoryId: e.target.value,
                          }))
                        }
                      >
                        <option value="">Select category</option>
                        {filteredFormCategories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                      {formErrors.categoryId && (
                        <span className="form-error">
                          {formErrors.categoryId}
                        </span>
                      )}
                    </div>

                    <div className="form-group">
                      <label className="form-label">Date</label>
                      <input
                        type="date"
                        className={`form-input ${
                          formErrors.transactionDate ? "error" : ""
                        }`}
                        value={formData.transactionDate}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            transactionDate: e.target.value,
                          }))
                        }
                      />
                      {formErrors.transactionDate && (
                        <span className="form-error">
                          {formErrors.transactionDate}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner" /> Saving...
                    </>
                  ) : editingTransaction ? (
                    "Update"
                  ) : (
                    "Create"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div
          className="modal-overlay"
          onClick={() => setDeleteConfirm(null)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Delete Transaction</h3>
              <button
                className="modal-close"
                onClick={() => setDeleteConfirm(null)}
              >
                <HiOutlineX />
              </button>
            </div>
            <div className="modal-body">
              <p className="confirm-text">
                Are you sure you want to delete this transaction? This action
                cannot be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setDeleteConfirm(null)}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={() => handleDelete(deleteConfirm)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
