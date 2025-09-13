import React, { useState, useEffect } from "react";
import { createEntry } from "../api";
import { suggestCategoriesFromTransaction, CategorySuggestion } from "../services/categorySuggestionService";
import { useCategories } from "../hooks/useCategories";

interface Transaction {
  date: string;
  description: string;
  amount: number;
  originalText: string;
}

interface CreateEntryFromTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  transaction: Transaction | null;
}

interface FormData {
  title: string;
  provider: string;
  type: string;
  category: string;
  subCategory: string;
  categoryId: string;
  subCategoryId: string;
  accountDetails: {
    accountType: string;
    accountNumber: string;
    sortCode: string;
    branch: string;
    billType: string;
    monthlyAmount: string;
    paymentDate: string;
    directDebit: boolean;
  };
  notes: string;
  confidential: boolean;
}

const initialFormData: FormData = {
  title: "",
  provider: "",
  type: "bill",
  category: "",
  subCategory: "",
  categoryId: "",
  subCategoryId: "",
  accountDetails: {
    accountType: "",
    accountNumber: "",
    sortCode: "",
    branch: "",
    billType: "Other",
    monthlyAmount: "",
    paymentDate: "",
    directDebit: false,
  },
  notes: "",
  confidential: true,
};

export default function CreateEntryFromTransactionModal({
  isOpen,
  onClose,
  onSuccess,
  transaction,
}: CreateEntryFromTransactionModalProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<CategorySuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  
  // Category management
  const { getRootCategories, getCategoriesByParent, getCategoryById, loading: categoriesLoading } = useCategories();
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);

  // Load category suggestions when transaction changes
  useEffect(() => {
    if (transaction && isOpen) {
      loadCategorySuggestions();
      populateFormFromTransaction();
    }
  }, [transaction, isOpen]);

  const loadCategorySuggestions = async () => {
    if (!transaction) return;
    
    setLoadingSuggestions(true);
    try {
      const categorySuggestions = await suggestCategoriesFromTransaction(transaction);
      setSuggestions(categorySuggestions);
      
      // Auto-select the best suggestion if available
      if (categorySuggestions.length > 0) {
        const bestSuggestion = categorySuggestions[0];
        
        // Find the category by ID from the suggestion
        const selectedCategory = getCategoryById(bestSuggestion.categoryId);
        const parentCategory = selectedCategory?.parentId ? getCategoryById(selectedCategory.parentId) : null;
        
        setFormData(prev => ({
          ...prev,
          category: parentCategory?.name || bestSuggestion.rootCategoryName,
          subCategory: selectedCategory?.name || bestSuggestion.categoryName,
          categoryId: parentCategory?._id || bestSuggestion.categoryId,
          subCategoryId: selectedCategory?._id || bestSuggestion.categoryId,
          provider: bestSuggestion.provider || extractProviderFromDescription(transaction.description),
          accountDetails: {
            ...prev.accountDetails,
            billType: bestSuggestion.suggestedBillType || "Other",
          }
        }));
        
        // Update selected parent for dropdown cascade
        setSelectedParentId(parentCategory?._id || null);
      }
    } catch (error) {
      console.error('Failed to load category suggestions:', error);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const populateFormFromTransaction = () => {
    if (!transaction) return;

    const provider = extractProviderFromDescription(transaction.description);
    const amount = Math.abs(transaction.amount).toFixed(2);
    const paymentDate = extractPaymentDate(transaction.date);

    setFormData(prev => ({
      ...prev,
      title: generateTitle(transaction.description, provider),
      provider: provider,
      accountDetails: {
        ...prev.accountDetails,
        monthlyAmount: amount,
        paymentDate: paymentDate,
        directDebit: transaction.originalText.includes('DD') || transaction.originalText.includes('DIRECT DEBIT'),
      },
      notes: `Auto-generated from bank transaction: ${transaction.originalText}`,
    }));
  };

  const extractProviderFromDescription = (description: string): string => {
    // Extract likely provider name from transaction description
    const cleanDesc = description.replace(/PAYMENT|DD|DIRECT DEBIT|CARD|ONLINE/gi, '').trim();
    const words = cleanDesc.split(' ');
    
    // Take first 1-2 meaningful words as provider name
    if (words.length >= 2) {
      return words.slice(0, 2).join(' ');
    }
    return words[0] || cleanDesc;
  };

  const generateTitle = (description: string, provider: string): string => {
    // Generate a clean title for the entry
    if (provider) {
      return `${provider} Payment`;
    }
    return description.replace(/PAYMENT|DD|DIRECT DEBIT/gi, '').trim() || 'Monthly Payment';
  };

  const extractPaymentDate = (transactionDate: string): string => {
    // Extract day of month for recurring payment prediction
    const date = new Date(transactionDate);
    return date.getDate().toString();
  };

  const applySuggestion = (suggestion: CategorySuggestion) => {
    // Find the category by ID from the suggestion
    const selectedCategory = getCategoryById(suggestion.categoryId);
    const parentCategory = selectedCategory?.parentId ? getCategoryById(selectedCategory.parentId) : null;
    
    setFormData(prev => ({
      ...prev,
      category: parentCategory?.name || suggestion.rootCategoryName,
      subCategory: selectedCategory?.name || suggestion.categoryName,
      categoryId: parentCategory?._id || suggestion.categoryId,
      subCategoryId: selectedCategory?._id || suggestion.categoryId,
      provider: suggestion.provider || prev.provider,
      accountDetails: {
        ...prev.accountDetails,
        billType: suggestion.suggestedBillType || "Other",
      }
    }));
    
    // Update selected parent for dropdown cascade
    setSelectedParentId(parentCategory?._id || null);
  };
  
  const handleCategoryChange = (categoryId: string) => {
    const category = getCategoryById(categoryId);
    if (category) {
      setSelectedParentId(categoryId);
      setFormData(prev => ({
        ...prev,
        category: category.name,
        categoryId: categoryId,
        subCategory: '',
        subCategoryId: ''
      }));
    }
  };
  
  const handleSubCategoryChange = (subCategoryId: string) => {
    const subCategory = getCategoryById(subCategoryId);
    if (subCategory) {
      setFormData(prev => ({
        ...prev,
        subCategory: subCategory.name,
        subCategoryId: subCategoryId
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = {
        title: formData.title,
        type: formData.type as "account" | "bill" | "investment" | "property" | "policy",
        provider: formData.provider,
        category: formData.category,
        subCategory: formData.subCategory,
        categoryId: formData.categoryId,
        accountDetails: {
          ...formData.accountDetails,
          category: formData.type,
        },
        notes: formData.notes,
        confidential: formData.confidential,
      };

      await createEntry(payload);

      // Reset form and close modal
      setFormData(initialFormData);
      setSuggestions([]);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to create entry");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAccountDetailChange = (
    field: keyof FormData["accountDetails"],
    value: string | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      accountDetails: {
        ...prev.accountDetails,
        [field]: value,
      },
    }));
  };

  if (!isOpen || !transaction) return null;

  const overlayStyle = {
    position: "fixed" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(15, 23, 42, 0.4)",
    backdropFilter: "blur(8px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    fontFamily: "Inter, system-ui, -apple-system, sans-serif",
  };

  const modalStyle = {
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    width: "90%",
    maxWidth: "640px",
    maxHeight: "90vh",
    overflow: "auto",
    boxShadow: "0 25px 50px -12px rgba(15, 23, 42, 0.25), 0 0 0 1px rgba(15, 23, 42, 0.05)",
    border: "1px solid #f1f5f9",
  };

  const headerStyle = {
    padding: "32px 32px 0 32px",
    borderBottom: "1px solid #f1f5f9",
    marginBottom: "32px",
    fontFamily: "Inter, system-ui, -apple-system, sans-serif",
  };

  const contentStyle = {
    padding: "0 32px 32px 32px",
  };

  const inputStyle = {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    fontSize: "16px",
    marginBottom: "20px",
    boxSizing: "border-box" as const,
    fontFamily: "Inter, system-ui, -apple-system, sans-serif",
    backgroundColor: "#fefefe",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    outline: "none",
    color: "#0f172a",
  };

  const selectStyle = {
    ...inputStyle,
    appearance: "none" as const,
    backgroundImage:
      "url(\"data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e\")",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 16px center",
    backgroundSize: "16px",
    paddingRight: "48px",
    cursor: "pointer",
  };

  const suggestionStyle = {
    padding: "16px",
    border: "1px solid #f1f5f9",
    borderRadius: "12px",
    marginBottom: "12px",
    cursor: "pointer",
    backgroundColor: "#f8fafc",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    fontFamily: "Inter, system-ui, -apple-system, sans-serif",
  };

  const buttonStyle = {
    padding: "12px 24px",
    borderRadius: "12px",
    fontSize: "15px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    border: "none",
    marginRight: "12px",
    fontFamily: "Inter, system-ui, -apple-system, sans-serif",
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: "#0f172a",
    color: "#ffffff",
    fontWeight: "600",
    boxShadow: "0 1px 3px 0 rgba(15, 23, 42, 0.1)",
  };

  const secondaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: "#ffffff",
    color: "#64748b",
    border: "1px solid #e2e8f0",
    fontWeight: "500",
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={headerStyle}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              paddingBottom: "16px",
            }}
          >
            <h2
              style={{
                fontSize: "24px",
                fontWeight: "600",
                color: "#0f172a",
                margin: 0,
                fontFamily: "Inter, system-ui, -apple-system, sans-serif",
                letterSpacing: "-0.025em",
              }}
            >
              Create Entry from Transaction
            </h2>
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                fontSize: "24px",
                cursor: "pointer",
                color: "#64748b",
                padding: "8px",
                borderRadius: "8px",
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ×
            </button>
          </div>
          
          {/* Transaction Preview */}
          <div style={{
            backgroundColor: "#f3f4f6",
            padding: "12px",
            borderRadius: "8px",
            marginBottom: "16px",
          }}>
            <div style={{ fontSize: "14px", color: "#64748b", marginBottom: "4px" }}>
              Transaction:
            </div>
            <div style={{ fontWeight: "500" }}>
              {transaction.description} • £{Math.abs(transaction.amount).toFixed(2)}
            </div>
            <div style={{ fontSize: "12px", color: "#9ca3af" }}>
              {transaction.date} • {transaction.originalText}
            </div>
          </div>
        </div>

        <div style={contentStyle}>
          <form onSubmit={handleSubmit}>
            {error && (
              <div
                style={{
                  backgroundColor: "#fee2e2",
                  border: "1px solid #fecaca",
                  color: "#dc2626",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  marginBottom: "16px",
                  fontSize: "14px",
                }}
              >
                {error}
              </div>
            )}

            {/* Category Suggestions */}
            {suggestions.length > 0 && (
              <div style={{ marginBottom: "24px" }}>
                <label style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#334155",
                  marginBottom: "8px",
                }}>
                  Suggested Categories {loadingSuggestions && "(Loading...)"}
                </label>
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    style={suggestionStyle}
                    onClick={() => applySuggestion(suggestion)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#e5e7eb";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#f9fafb";
                    }}
                  >
                    <div style={{ fontWeight: "500", marginBottom: "4px" }}>
                      {suggestion.categoryPath}
                    </div>
                    <div style={{ fontSize: "12px", color: "#6b7280" }}>
                      {suggestion.reason} • Confidence: {(suggestion.confidence * 100).toFixed(0)}%
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginBottom: "16px" }}>
              <label style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                color: "#334155",
                marginBottom: "4px",
              }}>
                Entry Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="e.g., British Gas Energy Bill"
                required
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                color: "#334155",
                marginBottom: "4px",
              }}>
                Provider *
              </label>
              <input
                type="text"
                value={formData.provider}
                onChange={(e) => handleInputChange("provider", e.target.value)}
                placeholder="e.g., British Gas"
                required
                style={inputStyle}
              />
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
              marginBottom: "16px",
            }}>
              <div>
                <label style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#334155",
                  marginBottom: "4px",
                }}>
                  Category
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  style={selectStyle}
                  disabled={categoriesLoading}
                >
                  <option value="">Select Category</option>
                  {getRootCategories().map(category => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#334155",
                  marginBottom: "4px",
                }}>
                  Sub-Category
                </label>
                <select
                  value={formData.subCategoryId}
                  onChange={(e) => handleSubCategoryChange(e.target.value)}
                  style={selectStyle}
                  disabled={categoriesLoading || !selectedParentId}
                >
                  <option value="">Select Sub-Category</option>
                  {selectedParentId && getCategoriesByParent(selectedParentId).map(subCategory => (
                    <option key={subCategory._id} value={subCategory._id}>
                      {subCategory.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
              marginBottom: "16px",
            }}>
              <div>
                <label style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#334155",
                  marginBottom: "4px",
                }}>
                  Monthly Amount
                </label>
                <input
                  type="text"
                  value={formData.accountDetails.monthlyAmount}
                  onChange={(e) => handleAccountDetailChange("monthlyAmount", e.target.value)}
                  placeholder="85.50"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#334155",
                  marginBottom: "4px",
                }}>
                  Payment Date (day of month)
                </label>
                <input
                  type="text"
                  value={formData.accountDetails.paymentDate}
                  onChange={(e) => handleAccountDetailChange("paymentDate", e.target.value)}
                  placeholder="15"
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "16px",
            }}>
              <input
                type="checkbox"
                id="directDebit"
                checked={formData.accountDetails.directDebit}
                onChange={(e) => handleAccountDetailChange("directDebit", e.target.checked)}
                style={{ width: "16px", height: "16px" }}
              />
              <label htmlFor="directDebit" style={{
                fontSize: "14px",
                color: "#334155",
                cursor: "pointer",
              }}>
                Direct Debit Payment
              </label>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                color: "#334155",
                marginBottom: "4px",
              }}>
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="Additional information..."
                style={{
                  ...inputStyle,
                  minHeight: "80px",
                  resize: "vertical" as const,
                  fontFamily: "inherit",
                }}
              />
            </div>

            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "24px",
            }}>
              <input
                type="checkbox"
                id="confidential"
                checked={formData.confidential}
                onChange={(e) => handleInputChange("confidential", e.target.checked)}
                style={{ width: "16px", height: "16px" }}
              />
              <label htmlFor="confidential" style={{
                fontSize: "14px",
                color: "#334155",
                cursor: "pointer",
              }}>
                Mark as confidential
              </label>
            </div>

            <div style={{
              display: "flex",
              justifyContent: "flex-end",
              paddingTop: "16px",
              borderTop: "1px solid #e5e7eb",
            }}>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                style={secondaryButtonStyle}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !formData.title || !formData.provider}
                style={{
                  ...primaryButtonStyle,
                  opacity: loading || !formData.title || !formData.provider ? 0.5 : 1,
                  cursor: loading || !formData.title || !formData.provider ? "not-allowed" : "pointer",
                }}
              >
                {loading ? "Creating..." : "Create Entry"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}