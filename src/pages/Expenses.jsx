// src/pages/Expenses.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Chart as ChartJS,
  LineElement, PointElement, LinearScale, CategoryScale,
  ArcElement, Tooltip, Legend, Filler
} from "chart.js";
import { Line, Doughnut } from "react-chartjs-2";
import '../styles/expenses.css';

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, ArcElement, Tooltip, Legend, Filler);

const SUMMARY_API = "https://3qcsvv8w40.execute-api.ap-southeast-2.amazonaws.com/prod/expenses-summary";

const currency = (v) =>
  (typeof v === "number" ? v : 0).toLocaleString(undefined, { style: "currency", currency: "SGD", maximumFractionDigits: 2 });

export default function Expenses() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [data, setData] = useState({
    summary: {
      totalAllTime: 0,
      totalThisMonth: 0,
      totalThisWeek: null,     // optional; shown if backend returns it
      monthly: [],
      breakdownByCategory: [],
      recentTransactions: [],
      needsReviewCount: 0,
    },
  });

  async function load() {
    const email = localStorage.getItem("userEmail");
    if (!email) { setErr("No user email found. Please sign in again."); setLoading(false); return; }
    setLoading(true); setErr("");
    try {
      const res = await fetch(`${SUMMARY_API}?range=all`, { headers: { "X-User-Email": email } });
      const j = await res.json();
      if (!res.ok || j.ok === false) throw new Error(j.error || `HTTP ${res.status}`);
      setData(j);
    } catch (e) {
      setErr(e.message || "Failed to load expenses.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  // Charts
  const lineData = useMemo(() => {
    const labels = (data.summary.monthly || []).map((m) => m.ym.slice(5)); // 'YYYY-MM' -> 'MM'
    const series = (data.summary.monthly || []).map((m) => m.total || 0);
    return {
      labels,
      datasets: [{
        data: series,
        tension: 0.35,
        fill: true,
        borderWidth: 3,
        pointRadius: 3,
        backgroundColor: "rgba(37,99,235,0.12)",
        borderColor: "rgba(37,99,235,1)"
      }]
    };
  }, [data]);

  const lineOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { mode: "index", intersect: false, padding: 10 } },
    scales: { x: { grid: { display: false } }, y: { grid: { color: "rgba(2,6,23,.06)" } } }
  };

  const donutData = useMemo(() => {
    const labels = (data.summary.breakdownByCategory || []).map((r) => r.category || "Uncategorized");
    const values = (data.summary.breakdownByCategory || []).map((r) => Number(r.total || 0));
    return {
      labels,
      datasets: [{
        data: values,
        backgroundColor: [
          "rgba(37,99,235,1)","rgba(107,114,128,1)","rgba(16,185,129,1)",
          "rgba(245,158,11,1)","rgba(239,68,68,1)","rgba(79,70,229,1)",
          "rgba(20,184,166,1)","rgba(236,72,153,1)","rgba(34,197,94,1)","rgba(2,132,199,1)"
        ],
        borderWidth: 0, cutout: "60%"
      }]
    };
  }, [data]);

  const donutOpts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { padding: 10 } } };

  const colors = (donutData.datasets?.[0]?.backgroundColor) || [];
  const legend = (data.summary.breakdownByCategory || []).map((r, i) => ({
    name: r.category || "Uncategorized",
    total: Number(r.total || 0),
    color: colors[i % colors.length],
  }));

  const fmtDelta = (pct) => {
    if (pct === null || pct === undefined) return "—";
    const up = pct >= 0;
    return `${up ? "↑" : "↓"} ${Math.abs(pct).toFixed(1)}% from last ${up ? (/* label set per card */"") : ""}`;
  };

  const needsReview = data.summary.needsReviewCount || 0;
  const topCat = (data.summary.breakdownByCategory || [])[0];

  return (
    <div className="page-wrap">
      <h1 className="mb-3">Expense Analysis</h1>

      {needsReview > 0 && <div className="alert alert-warning py-2 mb-3">⚠ Needs review: {needsReview}</div>}
      {err && <div className="alert alert-danger">{err}</div>}
      {loading && <div className="alert alert-info">Loading…</div>}

      {!loading && !err && (
        <>
          {/* KPI cards */}
          <div className="kpi-grid section">
            {/* Total (All Time) – no delta */}
            <div className="card-elevated kpi">
              <div className="label">Total Spend (All Time)</div>
              <div className="value">{currency(data.summary.totalAllTime)}</div>
            </div>

            {/* This Month with MoM delta */}
            <div className="card-elevated kpi">
              <div className="label">Spend This Month</div>
              <div className="value">{currency(data.summary.totalThisMonth)}</div>
              <div className={`delta ${Number(data.summary.periods?.monthDeltaPct) >= 0 ? "green" : "red"}`}>
                {data.summary.periods?.monthDeltaPct == null
                  ? "—"
                  : `${data.summary.periods.monthDeltaPct >= 0 ? "↑" : "↓"} ${Math.abs(data.summary.periods.monthDeltaPct).toFixed(1)}% from last month`}
              </div>
            </div>

            {/* This Week with WoW delta */}
            <div className="card-elevated kpi">
              <div className="label">Spend This Week</div>
              <div className="value">
                {data.summary.totalThisWeek != null ? currency(Number(data.summary.totalThisWeek)) : "—"}
              </div>
              <div className={`delta ${Number(data.summary.periods?.weekDeltaPct) >= 0 ? "green" : "red"}`}>
                {data.summary.periods?.weekDeltaPct == null
                  ? "—"
                  : `${data.summary.periods.weekDeltaPct >= 0 ? "↑" : "↓"} ${Math.abs(data.summary.periods.weekDeltaPct).toFixed(1)}% from last week`}
              </div>
            </div>
          </div>

          {/* Charts + Top categories */}
          <div className="charts-grid section">
            <div className="card-elevated chart-card">
              <div className="head">Monthly Expense Trend (12 mo)</div>
              <div className="chart-body"><Line data={lineData} options={lineOpts} /></div>
            </div>

            <div className="card-elevated chart-card">
              <div className="head">Category Breakdown (All Time)</div>
              <div className="chart-body"><Doughnut data={donutData} options={donutOpts} /></div>
              <div className="legend">
                {legend.map((e) => (
                  <div key={e.name} className="legend-row">
                    <span className="legend-left">
                      <i className="legend-swatch" style={{ background: e.color }} />
                      <span className="legend-name">{e.name}</span>
                    </span>
                    <span className="legend-amount">{currency(e.total)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent transactions */}
          <div className="card-elevated table-card section">
            <div className="title">Recent Transactions</div>
            <div className="table-responsive">
              <table className="table-modern">
                <thead>
                  <tr>
                    <th style={{width:"18%"}}>Date</th>
                    <th>Vendor</th>
                    <th style={{width:"22%"}}>Category</th>
                    <th style={{width:"18%"}} className="text-end">Total</th>
                    <th style={{width:"12%"}} className="text-center">Conf.</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.summary.recentTransactions || []).map((t) => {
                    const low = (t.category_confidence == null) || Number(t.category_confidence) < 0.6;
                    return (
                      <tr key={t.id}>
                        <td>{t.date}</td>
                        <td>{t.vendor || "—"}</td>
                        <td>
                          <span className={`badge-soft ${low ? "badge-warn" : ""}`}>
                            {t.category || "Uncategorized"}
                          </span>
                        </td>
                        <td className="text-end">{currency(Number(t.total || 0))}</td>
                        <td className="text-center">{t.category_confidence != null ? `${Math.round(t.category_confidence * 100)}%` : "—"}</td>
                      </tr>
                    );
                  })}
                  {(!data.summary.recentTransactions || data.summary.recentTransactions.length === 0) && (
                    <tr><td colSpan="5" className="text-center" style={{color:"var(--muted)"}}>No receipts yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </>
      )}
    </div>
  );
}
