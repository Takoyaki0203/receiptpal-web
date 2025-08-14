import { useEffect, useState } from "react";
import ReceiptCard from "../components/ReceiptCard"; // optional if you later show recent items
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip
} from "recharts";

const API_SUMMARY = "https://3qcsvv8w40.execute-api.ap-southeast-2.amazonaws.com/prod/expenses-summary";

export default function Expenses() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    const email = localStorage.getItem("userEmail") || "";
    fetch(API_SUMMARY, {
      method: "GET",
      headers: { "X-User-Email": email }
    })
      .then(async (r) => {
        const txt = await r.text();
        let data;
        try { data = JSON.parse(txt); } catch { throw new Error(txt || `HTTP ${r.status}`); }
        if (!r.ok || data.ok === false) throw new Error(data.error || `HTTP ${r.status}`);
        setSummary(data.summary);
      })
      .catch((e) => setErr(String(e.message || e)))
      .finally(() => setLoading(false));
  }, []);

  const fmtMoney = (v) => (v == null ? "—" : v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }));

  return (
    <div className="container py-4">
      <h2 className="mb-4">Expenses</h2>

      {loading && <div className="alert alert-info">Loading…</div>}
      {err && <div className="alert alert-danger">{err}</div>}

      {summary && (
        <>
          {/* KPI cards */}
          <div className="row g-3 mb-4">
            <div className="col-12 col-md-6">
              <div className="card shadow-sm">
                <div className="card-body">
                  <div className="text-muted">Total (All time)</div>
                  <div className="fs-2 fw-bold">${fmtMoney(summary.totalAllTime)}</div>
                </div>
              </div>
            </div>
            <div className="col-12 col-md-6">
              <div className="card shadow-sm">
                <div className="card-body">
                  <div className="text-muted">This Month</div>
                  <div className="fs-2 fw-bold">${fmtMoney(summary.totalThisMonth)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Trend chart */}
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="mb-3">Monthly Expense Trend (last 12 months)</h5>
              <div style={{ width: "100%", height: 300 }}>
                <ResponsiveContainer>
                  <AreaChart data={summary.monthly}>
                    <defs>
                      <linearGradient id="cFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopOpacity={0.4} />
                        <stop offset="100%" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="ym" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(v) => `$${fmtMoney(v)}`} />
                    <Area type="monotone" dataKey="total" strokeWidth={2} fill="url(#cFill)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
