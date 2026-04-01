import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import useAlertSocket from "../components/useAlertSocket";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend
} from "recharts";

const Alerts = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName") || "User";
  const userRole = localStorage.getItem("userRole") || "citizen";

  const [alerts, setAlerts] = useState([]);
  const [statsByType, setStatsByType] = useState([]);
  const [statsByDate, setStatsByDate] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [checkForm, setCheckForm] = useState({ parameter: "ph", value: "", location: "" });
  const [checking, setChecking] = useState(false);
  const [newAlert, setNewAlert] = useState({ type: "contamination", message: "", location: "" });
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("list");

  const fetchAlerts = () => {
    fetch("http://127.0.0.1:8000/alerts")
      .then(res => res.json())
      .then(data => { setAlerts(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  const fetchStats = () => {
    fetch("http://127.0.0.1:8000/alerts/stats/by-type")
      .then(res => res.json())
      .then(data => setStatsByType(Array.isArray(data) ? data : []))
      .catch(() => {});
    fetch("http://127.0.0.1:8000/alerts/stats/by-date")
      .then(res => res.json())
      .then(data => setStatsByDate(Array.isArray(data) ? data : []))
      .catch(() => {});
  };

  useAlertSocket((newAlertData) => {
    setAlerts(prev => {
      const exists = prev.find(a => a.id === newAlertData.id);
      if (exists) return prev;
      return [newAlertData, ...prev];
    });
  });

  useEffect(() => {
    fetchAlerts();
    fetchStats();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handleTriggerCheck = async () => {
    if (!checkForm.value || !checkForm.location) {
      alert("Please fill all fields");
      return;
    }
    setChecking(true);
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/alerts/trigger-check?parameter=${checkForm.parameter}&value=${checkForm.value}&location=${encodeURIComponent(checkForm.location)}`,
        { method: "POST" }
      );
      const data = await res.json();
      if (data.triggered) {
        alert(`Alert Triggered! A ${data.alert?.type || "contamination"} alert was created for ${checkForm.location}`);
        fetchAlerts();
        fetchStats();
      } else {
        alert("All values within safe range. No alert triggered.");
      }
    } catch {
      alert("Cannot connect to server");
    }
    setChecking(false);
  };

  const handleCreateAlert = async () => {
    if (!newAlert.message || !newAlert.location) {
      alert("Please fill all fields");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAlert),
      });
      if (res.ok) {
        alert("Alert created successfully!");
        setShowForm(false);
        setNewAlert({ type: "contamination", message: "", location: "" });
        fetchAlerts();
        fetchStats();
      } else {
        alert("Failed to create alert");
      }
    } catch {
      alert("Cannot connect to server");
    }
    setSubmitting(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this alert?")) return;
    try {
      await fetch(`http://127.0.0.1:8000/alerts/${id}`, { method: "DELETE" });
      fetchAlerts();
      fetchStats();
    } catch {
      alert("Cannot connect to server");
    }
  };

  const filteredAlerts = filterType === "all"
    ? alerts
    : alerts.filter(a => a.type === filterType);

  const getTypeBadge = (type) => {
    const styles = {
      boil_notice: "bg-amber-100 text-amber-700",
      contamination: "bg-red-100 text-red-600",
      outage: "bg-gray-100 text-gray-600",
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-black uppercase w-fit ${styles[type] || "bg-sky-100 text-sky-600"}`}>
        {type?.replace("_", " ")}
      </span>
    );
  };

  const whoThresholds = [
    { parameter: "pH", safe: "6.5 - 8.5", unit: "" },
    { parameter: "Turbidity", safe: "< 4", unit: "NTU" },
    { parameter: "Dissolved Oxygen", safe: "> 5", unit: "mg/L" },
    { parameter: "Temperature", safe: "< 70", unit: "C" },
  ];

  return (
    <div className="min-h-screen flex bg-sky-50 text-slate-800 font-sans">

      {/* Sidebar */}
      <div className="w-64 bg-sky-600 text-white flex flex-col p-6 shadow-xl">
        <h2 className="text-2xl font-bold mb-8 italic">WQM</h2>
        <div className="mb-8 p-4 bg-sky-700/40 rounded-xl border border-sky-400/30">
          <p className="text-[10px] uppercase tracking-widest text-sky-200">Session</p>
          <p className="font-bold text-lg leading-tight">{userName}</p>
          <span className="mt-2 inline-block bg-white text-sky-600 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">
            {userRole}
          </span>
        </div>
        <ul className="space-y-2 flex-1">
          <li onClick={() => navigate("/dashboard")} className="hover:bg-sky-500 p-3 rounded-lg cursor-pointer transition-colors">Dashboard</li>
          <li onClick={() => navigate("/map")} className="hover:bg-sky-500 p-3 rounded-lg cursor-pointer transition-colors">Live Map</li>
          <li onClick={() => navigate("/reports")} className="hover:bg-sky-500 p-3 rounded-lg cursor-pointer transition-colors">Reports</li>
          <li onClick={() => navigate("/water-data")} className="hover:bg-sky-500 p-3 rounded-lg cursor-pointer transition-colors">Water Data</li>
          <li onClick={() => navigate("/search")} className="hover:bg-sky-500 p-3 rounded-lg cursor-pointer transition-colors">Search</li>
          <li onClick={() => navigate("/readings")} className="hover:bg-sky-500 p-3 rounded-lg cursor-pointer transition-colors">Readings</li>
          <li className="bg-white text-sky-600 p-3 rounded-lg font-bold shadow-md">Alerts</li>
          {(userRole === "ngo" || userRole === "admin") && (
            <li onClick={() => navigate("/ngo/dashboard")} className="hover:bg-sky-500 p-3 rounded-lg cursor-pointer transition-colors">NGO Portal</li>
          )}
          {(userRole === "authority" || userRole === "admin") && (
            <li onClick={() => navigate("/authority/dashboard")} className="hover:bg-sky-500 p-3 rounded-lg cursor-pointer transition-colors">Authority Portal</li>
          )}
          <li onClick={() => navigate("/profile")} className="hover:bg-sky-500 p-3 rounded-lg cursor-pointer transition-colors">Profile</li>
        </ul>
        <button onClick={handleLogout} className="mt-auto bg-white text-sky-600 hover:bg-sky-50 py-2.5 rounded-lg font-bold transition-all shadow-lg">
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">

        {/* Header */}
        <header className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold text-sky-900">Alerts</h1>
            <p className="text-sky-600 font-medium italic">Monitor water quality alerts and WHO threshold breaches.</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-red-500 text-white px-6 py-2 rounded-xl font-bold shadow-lg hover:bg-red-600 transition-all">
            {showForm ? "Close" : "+ New Alert"}
          </button>
        </header>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: "Total Alerts", value: alerts.length, color: "text-sky-700", border: "border-sky-400" },
            { label: "Contamination", value: alerts.filter(a => a.type === "contamination").length, color: "text-red-600", border: "border-red-400" },
            { label: "Boil Notices", value: alerts.filter(a => a.type === "boil_notice").length, color: "text-amber-600", border: "border-amber-400" },
            { label: "Outages", value: alerts.filter(a => a.type === "outage").length, color: "text-gray-600", border: "border-gray-400" },
          ].map((stat, i) => (
            <div key={i} className={`bg-white border-l-4 ${stat.border} rounded-2xl p-6 shadow-sm`}>
              <h3 className="text-slate-500 text-sm font-semibold">{stat.label}</h3>
              <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* WHO Thresholds */}
        <div className="bg-white border border-sky-100 rounded-3xl p-6 shadow-sm mb-8">
          <h2 className="text-lg font-bold text-sky-900 mb-4">WHO Safety Thresholds</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {whoThresholds.map((t, i) => (
              <div key={i} className="bg-sky-50 rounded-xl p-4 text-center">
                <p className="text-xs font-black uppercase text-sky-500 tracking-widest">{t.parameter}</p>
                <p className="text-xl font-black text-sky-800">{t.safe}</p>
                <p className="text-xs text-sky-500">{t.unit}</p>
              </div>
            ))}
          </div>
        </div>

        {/* WHO Trigger Check */}
        <div className="bg-white border border-amber-100 rounded-3xl p-6 shadow-sm mb-8">
          <h2 className="text-lg font-bold text-amber-700 mb-1">WHO Threshold Auto-Check</h2>
          <p className="text-sm text-slate-500 mb-4">Enter a reading to check against WHO standards.</p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-bold text-gray-600 mb-1 block">Parameter</label>
              <select value={checkForm.parameter} onChange={e => setCheckForm({ ...checkForm, parameter: e.target.value })}
                className="w-full p-3 rounded-xl border-2 border-amber-200 focus:border-amber-400 outline-none">
                <option value="ph">pH</option>
                <option value="temperature">Temperature (C)</option>
                <option value="turbidity">Turbidity (NTU)</option>
                <option value="dissolved_oxygen">Dissolved Oxygen (mg/L)</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-bold text-gray-600 mb-1 block">Value</label>
              <input type="number" placeholder="Enter value..." value={checkForm.value}
                onChange={e => setCheckForm({ ...checkForm, value: e.target.value })}
                className="w-full p-3 rounded-xl border-2 border-amber-200 focus:border-amber-400 outline-none" />
            </div>
            <div>
              <label className="text-sm font-bold text-gray-600 mb-1 block">Location</label>
              <input type="text" placeholder="Enter location..." value={checkForm.location}
                onChange={e => setCheckForm({ ...checkForm, location: e.target.value })}
                className="w-full p-3 rounded-xl border-2 border-amber-200 focus:border-amber-400 outline-none" />
            </div>
            <div className="flex items-end">
              <button onClick={handleTriggerCheck} disabled={checking}
                className={`w-full py-3 rounded-xl font-bold text-white transition ${checking ? "bg-gray-400" : "bg-amber-500 hover:bg-amber-600"}`}>
                {checking ? "Checking..." : "Check Now"}
              </button>
            </div>
          </div>
        </div>

        {/* New Alert Form */}
        {showForm && (
          <div className="bg-white border border-red-100 rounded-3xl p-6 shadow-sm mb-8">
            <h2 className="text-xl font-bold text-red-700 mb-4">Create Manual Alert</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="text-sm font-bold text-gray-600 mb-1 block">Alert Type</label>
                <select value={newAlert.type} onChange={e => setNewAlert({ ...newAlert, type: e.target.value })}
                  className="w-full p-3 rounded-xl border-2 border-red-100 focus:border-red-400 outline-none">
                  <option value="contamination">Contamination</option>
                  <option value="boil_notice">Boil Notice</option>
                  <option value="outage">Outage</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-600 mb-1 block">Message</label>
                <input type="text" placeholder="Alert message..." value={newAlert.message}
                  onChange={e => setNewAlert({ ...newAlert, message: e.target.value })}
                  className="w-full p-3 rounded-xl border-2 border-red-100 focus:border-red-400 outline-none" />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-600 mb-1 block">Location</label>
                <input type="text" placeholder="Affected location..." value={newAlert.location}
                  onChange={e => setNewAlert({ ...newAlert, location: e.target.value })}
                  className="w-full p-3 rounded-xl border-2 border-red-100 focus:border-red-400 outline-none" />
              </div>
            </div>
            <button onClick={handleCreateAlert} disabled={submitting}
              className={`px-8 py-3 rounded-xl font-bold text-white transition ${submitting ? "bg-gray-400" : "bg-red-500 hover:bg-red-600"}`}>
              {submitting ? "Creating..." : "Create Alert"}
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[{ id: "list", label: "Alert List" }, { id: "stats", label: "Historical Trends" }].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-2 rounded-xl font-bold transition ${activeTab === tab.id ? "bg-sky-600 text-white shadow" : "bg-white text-sky-600 border border-sky-200 hover:bg-sky-50"}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Alert List */}
        {activeTab === "list" && (
          <>
            <div className="flex gap-2 mb-4 flex-wrap">
              {["all", "contamination", "boil_notice", "outage"].map(type => (
                <button key={type} onClick={() => setFilterType(type)}
                  className={`px-4 py-1.5 rounded-full text-xs font-black uppercase transition ${filterType === type ? "bg-sky-600 text-white" : "bg-white text-sky-600 border border-sky-200 hover:bg-sky-50"}`}>
                  {type === "all" ? "All Types" : type.replace("_", " ")}
                </button>
              ))}
            </div>
            <div className="bg-white rounded-3xl shadow-sm border border-sky-100 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-sky-50 text-sky-700 uppercase text-xs font-black tracking-widest">
                  <tr>
                    <th className="p-5">ID</th>
                    <th className="p-5">Type</th>
                    <th className="p-5">Message</th>
                    <th className="p-5">Location</th>
                    <th className="p-5">Issued At</th>
                    <th className="p-5">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sky-50">
                  {loading ? (
                    <tr><td colSpan="6" className="p-8 text-center text-gray-400">Loading alerts...</td></tr>
                  ) : filteredAlerts.length === 0 ? (
                    <tr><td colSpan="6" className="p-8 text-center text-gray-400">No alerts found</td></tr>
                  ) : (
                    filteredAlerts.map(alert => (
                      <tr key={alert.id} className="hover:bg-sky-50/40 transition-colors">
                        <td className="p-5 font-bold text-sky-700">#{alert.id}</td>
                        <td className="p-5">{getTypeBadge(alert.type)}</td>
                        <td className="p-5 text-slate-600 max-w-xs truncate">{alert.message}</td>
                        <td className="p-5 text-slate-600">{alert.location}</td>
                        <td className="p-5 text-slate-500">{alert.issued_at?.slice(0, 16).replace("T", " ")}</td>
                        <td className="p-5">
                          {(userRole === "admin" || userRole === "authority") && (
                            <button onClick={() => handleDelete(alert.id)}
                              className="text-red-400 hover:text-red-600 font-bold text-sm transition">
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Historical Stats */}
        {activeTab === "stats" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white border border-sky-100 rounded-3xl p-8 shadow-sm">
              <h2 className="text-xl font-bold text-sky-900 mb-6">Alerts by Type</h2>
              {statsByType.length === 0 ? (
                <p className="text-gray-400 text-center py-12">No data available</p>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statsByType}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f9ff" />
                      <XAxis dataKey="type" stroke="#0ea5e9" fontSize={11} />
                      <YAxis stroke="#0ea5e9" fontSize={11} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#0284c7" radius={[6, 6, 0, 0]} name="Count" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
            <div className="bg-white border border-sky-100 rounded-3xl p-8 shadow-sm">
              <h2 className="text-xl font-bold text-sky-900 mb-6">Daily Alert Trend</h2>
              {statsByDate.length === 0 ? (
                <p className="text-gray-400 text-center py-12">No data available</p>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={statsByDate}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f9ff" />
                      <XAxis dataKey="date" stroke="#0ea5e9" fontSize={10} />
                      <YAxis stroke="#0ea5e9" fontSize={11} />
                      <Tooltip />
                      <Legend iconType="circle" />
                      <Line type="monotone" dataKey="count" stroke="#0284c7" strokeWidth={4} name="Alerts" dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Alerts;