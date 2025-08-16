// src/pages/Expenses.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler, Legend
} from "chart.js";
import "../styles/expenses.css";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler, Legend);

const SUMMARY_API = "https://3qcsvv8w40.execute-api.ap-southeast-2.amazonaws.com/prod/expenses-summary"; // <-- your summary lambda

const getCurrencySymbol = () => localStorage.getItem("currencySymbol") || "$";
const money = (v) => (v == null ? "—" : `${getCurrencySymbol()} ${Number(v).toFixed(2)}`);

function pctChange(curr, prev) {
  if (!prev) return null;
  return ((Number(curr) - Number(prev)) / Number(prev)) * 100;
}
const monthLabel = (ym) => {
  const [y, m] = ym.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleString(undefined, { month: "short" });
};

export default function Expenses() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const email = localStorage.getItem("userEmail") || "";

  useEffect(() => {
    (async () => {
      setLoading(true); setErr(null);
      try {
        const res = await fetch(SUMMARY_API, { headers: { "X-User-Email": email } });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
        setSummary(data.summary);
      } catch (e) { setErr(e.message); }
      finally { setLoading(false); }
    })();
  }, [email]);

  const lastMonth = useMemo(() => {
    const arr = summary?.monthly || [];
    const curr = Number(arr.at(-1)?.total || 0);
    const prev = Number(arr.at(-2)?.total || 0);
    return { curr, prev, delta: pctChange(curr, prev) };
  }, [summary]);

  // Chart data with a soft fill
  const chartData = useMemo(() => {
    const labels = (summary?.monthly || []).map((m) => monthLabel(m.ym));
    const values = (summary?.monthly || []).map((m) => Number(m.total || 0));
    return {
      labels,
      datasets: [{
        label: "Monthly Expense",
        data: values,
        tension: 0.35,
        fill: true,
        borderWidth: 2,
        pointRadius: 3
      }]
    };
  }, [summary]);

  const chartOptions = {
    responsive: true,
    plugins: { legend: { display: false }, tooltip: { intersect: false } },
    scales: {
      y: { beginAtZero: true, ticks: { callback: (v) => `${getCurrencySymbol()} ${v}` } },
      x: { grid: { display: false } }
    }
  };

  return (
    <div className="expense-shell container py-4">
      <h2 className="mb-4">Expense Analysis</h2>
      {err && <div className="alert alert-danger">{err}</div>}

      <div className="row g-4">
        {/* Left: two stat cards stacked */}
        <div className="col-lg-4">
          <div className="stats-grid">
            <div className="stats-card">
              <div className="kpi-label">Total Expenses</div>
              <div className="kpi-value">{money(summary?.totalAllTime)}</div>
              <div className="kpi-sub">includes all receipts saved</div>
            </div>

            <div className="stats-card">
              <div className="kpi-label">Expenses This Month</div>
              <div className="kpi-value">{money(summary?.totalThisMonth)}</div>
              {summary && (
                <div className={`kpi-sub kpi-delta ${lastMonth.delta > 0 ? "negative" : "positive"}`}>
                  {lastMonth.delta == null
                    ? "no prior month to compare"
                    : `${lastMonth.delta > 0 ? "▲" : "▼"} ${Math.abs(lastMonth.delta).toFixed(1)}% from last month`}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: chart panel */}
        <div className="col-lg-8">
          <div className="panel">
            <div className="fw-semibold mb-3">Monthly Expense Trend</div>
            {loading ? (
              <div className="text-muted">Loading…</div>
            ) : (
              <Line data={chartData} options={chartOptions} height={80} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
