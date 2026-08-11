"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { getErrorMessage } from "@/lib/utils";
import toast from "react-hot-toast";
import {
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineX,
  HiOutlineTrendingUp,
  HiOutlineTrendingDown,
  HiOutlineTag,
} from "react-icons/hi";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({ name: "", type: "EXPENSE" });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories");
      setCategories(response.data.data.categories);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  // Filter by tab
  const filteredCategories =
    activeTab === "ALL"
      ? categories
      : categories.filter((cat) => cat.type === activeTab);

  // Modal handlers
  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({ name: "", type: "EXPENSE" });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, type: category.type });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setFormErrors({});
  };

  // Validation
  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Name is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Create or update
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory.id}`, formData);
        toast.success("Category updated");
      } else {
        await api.post("/categories", formData);
        toast.success("Category created");
      }
      closeModal();
      fetchCategories();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete
  const handleDelete = async (id) => {
    try {
      await api.delete(`/categories/${id}`);
      toast.success("Category deleted");
      setDeleteConfirm(null);
      fetchCategories();
    } catch (error) {
      toast.error(getErrorMessage(error));
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
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Categories</h1>
          <p className="page-description">
            Organize your transactions with custom categories
          </p>
        </div>
        <button className="btn btn-primary" onClick={openCreateModal}>
          <HiOutlinePlus /> Add Category
        </button>
      </div>

      {/* Tabs */}
      <div style={{ marginBottom: "var(--spacing-lg)" }}>
        <div className="tab-group">
          {["ALL", "INCOME", "EXPENSE"].map((tab) => (
            <button
              key={tab}
              className={`tab-btn ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "ALL" ? "All" : tab === "INCOME" ? "Income" : "Expense"}
            </button>
          ))}
        </div>
      </div>

      {/* Category Grid */}
      {filteredCategories.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">
              <HiOutlineTag />
            </div>
            <p className="empty-state-title">No categories found</p>
            <p className="empty-state-text">
              Create categories to organize your transactions.
            </p>
            <button className="btn btn-primary" onClick={openCreateModal}>
              <HiOutlinePlus /> Add Category
            </button>
          </div>
        </div>
      ) : (
        <div className="category-grid">
          {filteredCategories.map((category) => (
            <div
              key={category.id}
              className={`card category-card ${category.type.toLowerCase()}`}
            >
              <div className="category-card-content">
                <div className="category-info">
                  <div className="category-icon">
                    {category.type === "INCOME" ? (
                      <HiOutlineTrendingUp />
                    ) : (
                      <HiOutlineTrendingDown />
                    )}
                  </div>
                  <div>
                    <div className="category-name">{category.name}</div>
                    <div className="category-meta">
                      {category._count?.transactions || 0} transaction
                      {(category._count?.transactions || 0) !== 1 ? "s" : ""}
                    </div>
                  </div>
                </div>
                <div className="category-actions">
                  <button
                    className="btn btn-ghost btn-icon btn-sm"
                    onClick={() => openEditModal(category)}
                    title="Edit"
                  >
                    <HiOutlinePencil />
                  </button>
                  <button
                    className="btn btn-ghost btn-icon btn-sm"
                    onClick={() => setDeleteConfirm(category)}
                    title="Delete"
                    style={{ color: "var(--accent-expense)" }}
                  >
                    <HiOutlineTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingCategory ? "Edit Category" : "Add Category"}
              </h3>
              <button className="modal-close" onClick={closeModal}>
                <HiOutlineX />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="auth-form">
                  <div className="form-group">
                    <label className="form-label">Category Name</label>
                    <input
                      type="text"
                      className={`form-input ${formErrors.name ? "error" : ""}`}
                      placeholder="e.g., Groceries"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                    />
                    {formErrors.name && (
                      <span className="form-error">{formErrors.name}</span>
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
                        }))
                      }
                    >
                      <option value="EXPENSE">Expense</option>
                      <option value="INCOME">Income</option>
                    </select>
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
                  ) : editingCategory ? (
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
              <h3 className="modal-title">Delete Category</h3>
              <button
                className="modal-close"
                onClick={() => setDeleteConfirm(null)}
              >
                <HiOutlineX />
              </button>
            </div>
            <div className="modal-body">
              <p className="confirm-text">
                Are you sure you want to delete &quot;{deleteConfirm.name}
                &quot;? Categories with existing transactions cannot be deleted.
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
                onClick={() => handleDelete(deleteConfirm.id)}
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
