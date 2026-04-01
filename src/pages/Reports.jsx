import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const Reports = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ description: "", location: "", water_source: "" });
  const [submitting, setSubmitting] = useState(false);

  const fetchReports = () => {
    fetch("http://127.0.0.1:8000/reports")
      .then(res => res.json())
      .then(data => setLogs(data));
  };

  useEffect(() => { fetchReports(); }, []);

  const handleSubmit = async () => {
    setSubmitting(true);
    const token = localStorage.getItem("token");
    const userId = 1;
    try {
      const res = await fetch("http://127.0.0.1:8000/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ ...formData, user_id: userId })
      });
      if (res.ok) {
        alert("Report submitted successfully!");
        setShowForm(false);
        setFormData({ description: "", location: "", water_source: "" });
        fetchReports();
      } else {
        alert("Failed to submit report");
      }
    } catch {
      alert("Cannot connect to server");
    }
    setSubmitting(false);
  };

  const downloadCSV = () => {
    const headers = "ID,Description,Location,Water Source,Status,Date\n";
    const rows = logs.map(l => `${l.id},${l.description},${l.location},${l.water_source || ""},${l.status},${l.created_at}`).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "WQM_Report.csv";
    a.click();
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setTextColor(3, 105, 161);
    doc.text("Water Quality Management - Report", 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
    autoTable(doc, {
      head: [["ID", "Description", "Location", "Water Source", "Status", "Date"]],
      body: logs.map(l => [l.id, l.description, l.location, l.water_source || "N/A", l.status, l.created_at?.slice(0, 10)]),
      startY: 40, theme: "grid",
      headStyles: { fillColor: [3, 105, 161], textColor: [255, 255, 255] },
      styles: { fontSize: 9 }
    });
    doc.save("WQM_Report.pdf");
  };

  return (
    <div className="min-h-screen flex bg-sky-50 font-sans">
      <div className="w-64 bg-sky-600 text-white flex flex-col p-6 shadow-xl">
        <h2 className="text-2xl font-bold mb-8 italic">💧 WQM</h2>
        <ul className="space-y-2 flex-1">
          <li onClick={() => navigate("/dashboard")} className="hover:bg-sky-500 p-3 rounded-lg cursor-pointer">🏠 Dashboard</li>
          <li onClick={() => navigate("/map")} className="hover:bg-sky-500 p-3 rounded-lg cursor-pointer">📍 Live Map</li>
          <li className="bg-white text-sky-600 p-3 rounded-lg font-bold shadow-md">📊 Reports</li>
          <li onClick={() => navigate("/water-data")} className="hover:bg-sky-500 p-3 rounded-lg cursor-pointer">🌊 Water Data</li>
          <li onClick={() => navigate("/search")} className="hover:bg-sky-500 p-3 rounded-lg cursor-pointer">🔍 Search</li>
          <li onClick={() => navigate("/readings")} className="hover:bg-sky-500 p-3 rounded-lg cursor-pointer">📈 Readings</li>
          <li onClick={() => navigate("/profile")} className="hover:bg-sky-500 p-3 rounded-lg cursor-pointer">👤 Profile</li>
        </ul>
      </div>
      <div className="flex-1 p-8">
        <header className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-sky-900">Reports</h1>
            <p className="text-sky-600 font-medium italic">Submit and track water quality reports.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowForm(!showForm)} className="bg-green-500 text-white px-6 py-2 rounded-xl font-bold shadow-lg hover:bg-green-600 transition-all">
              {showForm ? "✕ Close Form" : "+ Submit Report"}
            </button>
            <button onClick={downloadCSV} className="bg-sky-600 text-white px-6 py-2 rounded-xl font-bold shadow-lg hover:bg-sky-700 transition-all">CSV</button>
            <button onClick={downloadPDF} className="bg-white text-sky-600 border border-sky-200 px-6 py-2 rounded-xl font-bold hover:bg-sky-50 transition-all">PDF</button>
          </div>
        </header>

        {showForm && (
          <div className="bg-white rounded-2xl border border-sky-100 shadow-sm p-6 mb-8">
            <h2 className="text-xl font-bold text-sky-800 mb-4">Submit New Report</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="text-sm font-bold text-gray-600 mb-1 block">Description</label>
                <input type="text" placeholder="Describe the issue..."
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full p-3 rounded-xl border-2 border-sky-200 focus:border-sky-500 outline-none" />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-600 mb-1 block">Location</label>
                <input type="text" placeholder="Enter location..."
                  value={formData.location}
                  onChange={e => setFormData({...formData, location: e.target.value})}
                  className="w-full p-3 rounded-xl border-2 border-sky-200 focus:border-sky-500 outline-none" />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-600 mb-1 block">Water Source</label>
                <select value={formData.water_source}
                  onChange={e => setFormData({...formData, water_source: e.target.value})}
                  className="w-full p-3 rounded-xl border-2 border-sky-200 focus:border-sky-500 outline-none">
                  <option value="">Select source...</option>
                  <option value="River">River</option>
                  <option value="Lake">Lake</option>
                  <option value="Groundwater">Groundwater</option>
                  <option value="Tap Water">Tap Water</option>
                  <option value="Reservoir">Reservoir</option>
                </select>
              </div>
            </div>
            <button onClick={handleSubmit} disabled={submitting}
              className={`px-8 py-3 rounded-xl font-bold text-white transition ${submitting ? "bg-gray-400" : "bg-sky-600 hover:bg-sky-700"}`}>
              {submitting ? "Submitting..." : "Submit Report"}
            </button>
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-sm border border-sky-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-sky-50 text-sky-700 uppercase text-xs font-black tracking-widest">
              <tr>
                <th className="p-5">ID</th>
                <th className="p-5">Description</th>
                <th className="p-5">Location</th>
                <th className="p-5">Water Source</th>
                <th className="p-5">Status</th>
                <th className="p-5">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sky-50">
              {logs.length === 0 ? (
                <tr><td colSpan="6" className="p-8 text-center text-gray-400">No reports found</td></tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-sky-50/40 transition-colors">
                    <td className="p-5 font-bold text-sky-700">#{log.id}</td>
                    <td className="p-5 text-slate-600">{log.description}</td>
                    <td className="p-5 text-slate-600">{log.location}</td>
                    <td className="p-5 text-slate-600">{log.water_source || "N/A"}</td>
                    <td className="p-5">
                      <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                        log.status === "verified" ? "bg-green-100 text-green-600" :
                        log.status === "rejected" ? "bg-red-100 text-red-600" :
                        "bg-yellow-100 text-yellow-600"}`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="p-5 text-slate-500">{log.created_at?.slice(0, 10)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
