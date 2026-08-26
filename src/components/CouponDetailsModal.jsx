import React from "react";

export default function CouponDetailsModal({ isOpen, coupon, onClose }) {
  if (!isOpen || !coupon) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>Coupon Details</h2>
            <p style={styles.subtitle}>
              Complete information about this coupon
            </p>
          </div>

          <button style={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        <div style={styles.codeSection}>
          <span style={styles.codeLabel}>Coupon Code</span>
          <div style={styles.codeBadge}>{coupon.code}</div>
        </div>

        <div style={styles.detailsGrid}>
          <div style={styles.infoCard}>
            <span style={styles.label}>Credits</span>
            <span style={styles.value}>{coupon.credits}</span>
          </div>

          <div style={styles.infoCard}>
            <span style={styles.label}>Usage Limit</span>
            <span style={styles.value}>{coupon.limit}</span>
          </div>

          <div style={styles.infoCard}>
            <span style={styles.label}>Total Used</span>
            <span style={styles.value}>{coupon.totalUsed}</span>
          </div>

          <div style={styles.infoCard}>
            <span style={styles.label}>Status</span>
            <span
              style={{
                ...styles.statusBadge,
                backgroundColor: coupon.status ? "#dcfce7" : "#fee2e2",
                color: coupon.status ? "#15803d" : "#dc2626",
              }}
            >
              {coupon.status ? "Active" : "Inactive"}
            </span>
          </div>
        </div>

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Additional Information</h3>

          <div style={styles.row}>
            <span>Expiry Date</span>
            <strong>
              {coupon.expiry
                ? new Date(coupon.expiry).toLocaleDateString()
                : "N/A"}
            </strong>
          </div>

          <div style={styles.row}>
            <span>Coupon ID</span>
            <strong>{coupon._id || "N/A"}</strong>
          </div>

          <div style={styles.row}>
            <span>Created At</span>
            <strong>
              {coupon.createdAt
                ? new Date(coupon.createdAt).toLocaleString()
                : "N/A"}
            </strong>
          </div>

          <div style={styles.row}>
            <span>Updated At</span>
            <strong>
              {coupon.updatedAt
                ? new Date(coupon.updatedAt).toLocaleString()
                : "N/A"}
            </strong>
          </div>
        </div>

        <div style={styles.footer}>
          <button style={styles.closeButton} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15,23,42,0.65)",
    backdropFilter: "blur(4px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
    padding: "20px",
  },

  modal: {
    width: "650px",
    maxWidth: "100%",
    background: "#ffffff",
    borderRadius: "24px",
    padding: "28px",
    boxShadow: "0 25px 60px rgba(0,0,0,0.25)",
    border: "1px solid #e5e7eb",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "24px",
  },

  title: {
    margin: 0,
    fontSize: "28px",
    fontWeight: "700",
    color: "#111827",
  },

  subtitle: {
    marginTop: "6px",
    color: "#6b7280",
    fontSize: "14px",
  },

  closeBtn: {
    width: "38px",
    height: "38px",
    borderRadius: "50%",
    border: "none",
    background: "#f3f4f6",
    cursor: "pointer",
    fontSize: "18px",
    fontWeight: "bold",
  },

  codeSection: {
    textAlign: "center",
    marginBottom: "24px",
  },

  codeLabel: {
    display: "block",
    color: "#6b7280",
    marginBottom: "10px",
    fontSize: "13px",
    textTransform: "uppercase",
    fontWeight: "600",
  },

  codeBadge: {
    display: "inline-block",
    background: "linear-gradient(135deg,#2563eb,#3b82f6)",
    color: "#fff",
    padding: "12px 24px",
    borderRadius: "12px",
    fontSize: "22px",
    fontWeight: "700",
    letterSpacing: "2px",
  },

  detailsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))",
    gap: "14px",
    marginBottom: "24px",
  },

  infoCard: {
    background: "#f8fafc",
    border: "1px solid #e5e7eb",
    borderRadius: "14px",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  label: {
    color: "#6b7280",
    fontSize: "12px",
    textTransform: "uppercase",
    fontWeight: "600",
  },

  value: {
    color: "#111827",
    fontSize: "20px",
    fontWeight: "700",
  },

  statusBadge: {
    display: "inline-flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: "999px",
    padding: "8px 12px",
    fontWeight: "700",
    fontSize: "13px",
  },

  section: {
    background: "#fafafa",
    borderRadius: "16px",
    padding: "18px",
    border: "1px solid #ececec",
  },

  sectionTitle: {
    marginTop: 0,
    marginBottom: "16px",
    fontSize: "17px",
    color: "#111827",
  },

  row: {
    display: "flex",
    justifyContent: "space-between",
    padding: "12px 0",
    borderBottom: "1px solid #e5e7eb",
    fontSize: "14px",
  },

  footer: {
    marginTop: "24px",
    display: "flex",
    justifyContent: "flex-end",
  },

  closeButton: {
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    padding: "12px 24px",
    fontWeight: "600",
    cursor: "pointer",
  },
};
