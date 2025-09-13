import React, { useEffect, useState } from "react";
import { 
  Receipt, 
  Plus, 
  Grid3X3, 
  List, 
  Search,
  Filter,
  Zap,
  Droplets,
  Wifi,
  Car,
  Phone
} from "lucide-react";
import { getEntries, Entry, deleteEntry } from "../api";
import AddBillModal from "../components/AddBillModal";
import EditBillModal from "../components/EditBillModal";
import AccountDetailModal from "../components/AccountDetailModal";

export default function Bills() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Entry | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  useEffect(() => {
    loadBills();
  }, []);

  const loadBills = async () => {
    try {
      setLoading(true);
      const data = await getEntries();
      // Filter for bill-type entries
      const billEntries = data.entries.filter((entry: Entry) => 
        entry.type === "bill" || 
        entry.accountDetails?.billType ||
        entry.title.toLowerCase().includes("bill") ||
        entry.title.toLowerCase().includes("utilities") ||
        entry.title.toLowerCase().includes("energy") ||
        entry.title.toLowerCase().includes("council tax") ||
        entry.title.toLowerCase().includes("tv licence")
      );
      setEntries(billEntries);
      setFilteredEntries(billEntries);
    } catch (err: any) {
      setError(err.message || "Failed to load bills");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = entries;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((entry) =>
        entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.accountDetails?.billType?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedFilter !== "all") {
      filtered = filtered.filter((entry) => {
        const billType = entry.accountDetails?.billType?.toLowerCase() || "";
        switch (selectedFilter) {
          case "energy":
            return billType.includes("gas") || billType.includes("electricity") || billType.includes("energy");
          case "water":
            return billType.includes("water");
          case "internet":
            return billType.includes("internet") || billType.includes("broadband") || billType.includes("wifi");
          case "phone":
            return billType.includes("phone") || billType.includes("mobile");
          case "tv":
            return billType.includes("tv") || billType.includes("licence") || billType.includes("streaming");
          case "council":
            return billType.includes("council") || billType.includes("tax");
          default:
            return true;
        }
      });
    }

    setFilteredEntries(filtered);
  }, [entries, searchTerm, selectedFilter]);

  const handleAdd = () => {
    setShowAddModal(true);
  };

  const handleEdit = (bill: Entry) => {
    setSelectedBill(bill);
    setShowEditModal(true);
  };

  const handleViewDetails = (bill: Entry) => {
    setSelectedBill(bill);
    setShowDetailModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this bill?")) return;
    try {
      await deleteEntry(id);
      await loadBills();
    } catch (err: any) {
      setError(err.message || "Failed to delete bill");
    }
  };

  const getBillIcon = (billType: string) => {
    const type = billType.toLowerCase();
    if (type.includes("gas") || type.includes("electricity") || type.includes("energy")) {
      return <Zap size={20} strokeWidth={1.5} />;
    }
    if (type.includes("water")) {
      return <Droplets size={20} strokeWidth={1.5} />;
    }
    if (type.includes("internet") || type.includes("broadband") || type.includes("wifi")) {
      return <Wifi size={20} strokeWidth={1.5} />;
    }
    if (type.includes("phone") || type.includes("mobile")) {
      return <Phone size={20} strokeWidth={1.5} />;
    }
    return <Receipt size={20} strokeWidth={1.5} />;
  };

  // Styles
  const containerStyle = {
    padding: "40px",
    maxWidth: "1400px",
    margin: "0 auto",
    fontFamily: "Inter, system-ui, -apple-system, sans-serif",
  };

  const headerStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "32px",
  };

  const titleStyle = {
    fontSize: "32px",
    fontWeight: "600" as const,
    color: "#0f172a",
    margin: "0",
    display: "flex",
    alignItems: "center",
    gap: "12px",
  };

  const controlsStyle = {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    marginBottom: "32px",
    flexWrap: "wrap" as const,
  };

  const searchStyle = {
    position: "relative" as const,
    flex: "1",
    maxWidth: "400px",
  };

  const searchInputStyle = {
    width: "100%",
    padding: "12px 16px 12px 44px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    fontSize: "14px",
    fontFamily: "Inter, system-ui, -apple-system, sans-serif",
    outline: "none",
    transition: "border-color 0.2s",
  };

  const buttonStyle = {
    padding: "12px 20px",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: "500" as const,
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontFamily: "Inter, system-ui, -apple-system, sans-serif",
    border: "none",
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: "#0f172a",
    color: "#ffffff",
  };

  const secondaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: "#ffffff",
    color: "#64748b",
    border: "1px solid #e2e8f0",
  };

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: "24px",
  };

  const cardStyle = {
    backgroundColor: "#ffffff",
    border: "1px solid #f1f5f9",
    borderRadius: "16px",
    padding: "24px",
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: "0 1px 3px 0 rgba(15, 23, 42, 0.08)",
  };

  const loadingStyle = {
    textAlign: "center" as const,
    padding: "80px 40px",
    color: "#64748b",
  };

  const emptyStateStyle = {
    textAlign: "center" as const,
    padding: "80px 40px",
    color: "#64748b",
  };

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={loadingStyle}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "64px",
            height: "64px",
            backgroundColor: "#f1f5f9",
            borderRadius: "16px",
            margin: "0 auto 24px",
          }}>
            <Receipt size={28} color="#64748b" strokeWidth={1.5} />
          </div>
          <p style={{
            fontSize: "16px",
            fontWeight: "500",
            margin: "0",
            fontFamily: "Inter, system-ui, -apple-system, sans-serif",
          }}>Loading bills...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>
          <Receipt size={32} strokeWidth={1.5} />
          Bills
        </h1>
        <button onClick={handleAdd} style={primaryButtonStyle}>
          <Plus size={16} strokeWidth={1.5} />
          Add Bill
        </button>
      </div>

      <div style={controlsStyle}>
        <div style={searchStyle}>
          <Search
            size={18}
            color="#64748b"
            style={{
              position: "absolute",
              left: "14px",
              top: "50%",
              transform: "translateY(-50%)",
            }}
          />
          <input
            type="text"
            placeholder="Search bills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={searchInputStyle}
          />
        </div>

        <select
          value={selectedFilter}
          onChange={(e) => setSelectedFilter(e.target.value)}
          style={{
            ...secondaryButtonStyle,
            paddingRight: "40px",
            appearance: "none",
            backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='1.5'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 12px center",
            backgroundSize: "16px",
          }}
        >
          <option value="all">All Bills</option>
          <option value="energy">Energy</option>
          <option value="water">Water</option>
          <option value="internet">Internet</option>
          <option value="phone">Phone</option>
          <option value="tv">TV & Streaming</option>
          <option value="council">Council Tax</option>
        </select>

        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => setViewMode("grid")}
            style={{
              ...secondaryButtonStyle,
              backgroundColor: viewMode === "grid" ? "#f1f5f9" : "#ffffff",
            }}
          >
            <Grid3X3 size={16} strokeWidth={1.5} />
          </button>
          <button
            onClick={() => setViewMode("list")}
            style={{
              ...secondaryButtonStyle,
              backgroundColor: viewMode === "list" ? "#f1f5f9" : "#ffffff",
            }}
          >
            <List size={16} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {error && (
        <div style={{
          backgroundColor: "#fef2f2",
          border: "1px solid #fecaca",
          borderRadius: "12px",
          padding: "16px",
          marginBottom: "24px",
          color: "#dc2626",
        }}>
          {error}
        </div>
      )}

      {filteredEntries.length === 0 ? (
        <div style={emptyStateStyle}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "64px",
            height: "64px",
            backgroundColor: "#f1f5f9",
            borderRadius: "16px",
            margin: "0 auto 24px",
          }}>
            <Receipt size={28} color="#64748b" strokeWidth={1.5} />
          </div>
          <p style={{
            fontSize: "16px",
            fontWeight: "500",
            marginBottom: "24px",
            fontFamily: "Inter, system-ui, -apple-system, sans-serif",
          }}>
            {searchTerm || selectedFilter !== "all" ? "No bills match your filters" : "No bills found"}
          </p>
          <button onClick={handleAdd} style={primaryButtonStyle}>
            <Plus size={16} strokeWidth={1.5} />
            Add your first bill
          </button>
        </div>
      ) : (
        <div style={gridStyle}>
          {filteredEntries.map((bill) => (
            <div
              key={bill._id}
              style={cardStyle}
              onClick={() => handleViewDetails(bill)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 8px 25px -5px rgba(15, 23, 42, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow = "0 1px 3px 0 rgba(15, 23, 42, 0.08)";
              }}
            >
              <div style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                marginBottom: "16px",
              }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "40px",
                  height: "40px",
                  backgroundColor: "#f1f5f9",
                  borderRadius: "12px",
                  flexShrink: 0,
                }}>
                  {getBillIcon(bill.accountDetails?.billType || "")}
                </div>
              </div>

              <h3 style={{
                fontSize: "16px",
                fontWeight: "600",
                color: "#0f172a",
                marginBottom: "8px",
                fontFamily: "Inter, system-ui, -apple-system, sans-serif",
              }}>
                {bill.title}
              </h3>

              <p style={{
                fontSize: "14px",
                color: "#64748b",
                marginBottom: "12px",
                fontFamily: "Inter, system-ui, -apple-system, sans-serif",
              }}>
                {bill.provider}
              </p>

              {bill.accountDetails?.billType && (
                <div style={{
                  display: "inline-block",
                  backgroundColor: "#f0f9ff",
                  color: "#0ea5e9",
                  fontSize: "12px",
                  fontWeight: "500",
                  padding: "4px 8px",
                  borderRadius: "6px",
                  marginBottom: "12px",
                }}>
                  {bill.accountDetails.billType}
                </div>
              )}

              {bill.accountDetails?.billingFrequency && (
                <p style={{
                  fontSize: "12px",
                  color: "#94a3b8",
                  margin: "0",
                  fontFamily: "Inter, system-ui, -apple-system, sans-serif",
                }}>
                  Billed {bill.accountDetails.billingFrequency}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {showAddModal && (
        <AddBillModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            loadBills();
          }}
        />
      )}

      {showEditModal && selectedBill && (
        <EditBillModal
          isOpen={showEditModal}
          bill={selectedBill}
          onClose={() => {
            setShowEditModal(false);
            setSelectedBill(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setSelectedBill(null);
            loadBills();
          }}
        />
      )}

      {showDetailModal && selectedBill && (
        <AccountDetailModal
          isOpen={showDetailModal}
          entry={selectedBill}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedBill(null);
          }}
          onEdit={() => {
            setShowDetailModal(false);
            setShowEditModal(true);
          }}
          onDelete={() => {
            handleDelete(selectedBill._id);
            setShowDetailModal(false);
            setSelectedBill(null);
          }}
        />
      )}
    </div>
  );
}