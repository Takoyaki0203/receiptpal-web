import React from "react";

function currencyPrefix(codeOrSymbol) {
  if (!codeOrSymbol) return "";
  const c = codeOrSymbol.toUpperCase ? codeOrSymbol.toUpperCase() : codeOrSymbol;
  if (c === "SGD") return "S$";
  if (c === "USD") return "$";
  if (c === "MYR") return "RM";
  if (c === "EUR") return "€";
  if (c === "GBP") return "£";
  // If backend already sends "$" or "€", just use it
  if (["$", "€", "£"].includes(codeOrSymbol)) return codeOrSymbol;
  return ""; // default: no prefix
}

export default function ReceiptCard({ data }) {
  if (!data) return null;

  const cur = currencyPrefix(data.currency);
  const money = (v) =>
    v === null || v === undefined ? "—" : `${cur}${Number(v).toFixed(2)}`;

  // Fallbacks if backend didn’t send subtotal/tax
  const itemsTotal = (data.items || [])
    .map((i) => Number(i.price || 0))
    .reduce((a, b) => a + b, 0);

  const subtotal = data.subtotal ?? (itemsTotal || null);
  const total = data.total ?? (subtotal != null && data.tax != null
      ? Number(subtotal) + Number(data.tax)
      : itemsTotal || null);

  return (
    <div className="card shadow-sm border-0 my-4">
      <div className="card-body">
        {/* Header */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-3">
          <div>
            <h3 className="mb-1">{data.vendor || "Receipt"}</h3>
            <div className="text-muted">
              {data.date || ""}
            </div>
          </div>
          <div className="text-end">
            <div className="text-muted">Total</div>
            <div style={{ fontSize: 28, fontWeight: 700 }}>{money(total)}</div>
          </div>
        </div>

        {/* Items */}
        <div className="table-responsive">
          <table className="table align-middle">
            <thead className="table-light">
              <tr>
                <th style={{ width: "55%" }}>Item</th>
                <th style={{ width: 80 }} className="text-end">Qty</th>
                <th style={{ width: 140 }} className="text-end">Unit</th>
                <th style={{ width: 140 }} className="text-end">Price</th>
              </tr>
            </thead>
            <tbody>
              {(data.items || []).map((it, idx) => (
                <tr key={idx}>
                  <td>{it.name || "Item"}</td>
                  <td className="text-end">
                    {it.qty === null || it.qty === undefined ? "—" : Number(it.qty)}
                  </td>
                  <td className="text-end">{money(it.unit_price)}</td>
                  <td className="text-end">{money(it.price)}</td>
                </tr>
              ))}
              {(!data.items || data.items.length === 0) && (
                <tr>
                  <td colSpan={4} className="text-center text-muted py-4">
                    No line items found.
                  </td>
                </tr>
              )}
            </tbody>
            {/* Totals */}
            <tfoot>
              <tr>
                <td colSpan={3} className="text-end fw-semibold">Subtotal</td>
                <td className="text-end">{money(subtotal)}</td>
              </tr>
              <tr>
                <td colSpan={3} className="text-end fw-semibold">Tax</td>
                <td className="text-end">{money(data.tax)}</td>
              </tr>
              <tr>
                <td colSpan={3} className="text-end fw-bold">Total</td>
                <td className="text-end fw-bold">{money(total)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
