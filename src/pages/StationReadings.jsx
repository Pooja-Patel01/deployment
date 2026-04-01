import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const PARAMETERS = ["pH", "turbidity", "DO"];
const COLORS = { pH: "#0ea5e9", turbidity: "#f59e0b", DO: "#10b981" };
const WHO_LIMITS = { pH: { min: 6.5, max: 8.5 }, turbidity: { min: 0, max: 4 }, DO: { min: 5, max: 99 } };

const StationReadings = () => {
  const navigate = useNavigate();
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [readings, setReadings] = useState({});
  const [activeParam, setActiveParam] = useState("pH");

  useEffect(() => {
    fetch("http://127.0.0.1:8000/stations")
      .then(res => res.json())
      .then(data => {
        setStations(data);
        if (data.length > 0) setSelectedStation(data[1] || data[0]);
      });
  }, []);

  useEffect(() => {
    if (!selectedStation) return;
    PARAMETERS.forEach(param => {
      fetch(`http://127.0.0.1:8000/stations/${selectedStation.id}/readings/${param}`)
        .then(res => res.json())
        .then(data => {
          setReadings(prev => ({ ...prev, [param]: data }));
        });
    });
  }, [selectedStation]);

  const chartData = (readings[activeParam] || []).map(r => ({
    time: new Date(r.recorded_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    value: parseFloat(r.value)
  }));

  const latestValue = chartData.length > 0 ? chartData[chartData.length - 1].value : null;
  const limits = WHO_LIMITS[activeParam];
  const isSafe = latestValue !== null && latestValue >= limits.min && latestValue <= limits.max;

  return (
    <div className="min-h-screen flex bg-sky-50 font-sans">
      <div className="w-64 bg-sky-600 text-white flex flex-col p-6 shadow-xl">
        <h2 className="text-2xl font-bold mb-8 italic">💧 WQM</h2>
        <ul className="space-y-2 flex-1">
          <li onClick={() => navigate("/dashboard")} className="hover:bg-sky-500 p-3 rounded-lg cursor-pointer">🏠 Dashboard</li>
          <li onClick={() => navigate("/map")} className="hover:bg-sky-500 p-3 rounded-lg cursor-pointer">📍 Live Map</li>
          <li onClick={() => navigate("/reports")} className="hover:bg-sky-500 p-3 rounded-lg cursor-pointer">📊 Reports</li>
          <li onClick={() => navigate("/water-data")} className="hover:bg-sky-500 p-3 rounded-lg cursor-pointer">🌊 Water Data</li>
          <li onClick={() => navigate("/search")} className="hover:bg-sky-500 p-3 rounded-lg cursor-pointer">🔍 Search</li>
          <li className="bg-white text-sky-600 p-3 rounded-lg font-bold shadow-md">📈 Readings</li>
          <li onClick={() => navigate("/profile")} className="hover:bg-sky-500 p-3 rounded-lg cursor-pointer">👤 Profile</li>
        </ul>
      </div>
      <div className="flex-1 p-8">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-sky-900">Station Readings</h1>
          <p className="text-sky-600">Real-time water quality parameters</p>
        </header>
        <div className="mb-6">
          <label className="text-sky-800 font-bold mr-3">Select Station:</label>
          <select
            className="p-3 rounded-xl border-2 border-sky-200 focus:border-sky-500 outline-none"
            onChange={e => setSelectedStation(stations.find(s => s.id === parseInt(e.target.value)))}
            value={selectedStation?.id || ""}
          >
            {stations.filter(s => s.name !== "string").map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-3 mb-6">
          {PARAMETERS.map(p => (
            <button key={p} onClick={() => setActiveParam(p)}
              className={`px-6 py-2 rounded-full font-bold transition ${activeParam === p ? "bg-sky-600 text-white" : "bg-white text-sky-600 border-2 border-sky-200"}`}>
              {p}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className={`bg-white rounded-2xl p-6 border-2 ${isSafe ? "border-green-300" : "border-red-300"}`}>
            <p className="text-gray-500 text-sm">Latest {activeParam}</p>
            <p className={`text-4xl font-black ${isSafe ? "text-green-600" : "text-red-600"}`}>
              {latestValue ?? "N/A"}
            </p>
            <p className={`text-sm font-bold mt-1 ${isSafe ? "text-green-500" : "text-red-500"}`}>
              {latestValue !== null ? (isSafe ? "✅ Safe" : "⚠️ Unsafe") : "No data"}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-sky-100">
            <p className="text-gray-500 text-sm">WHO Safe Range</p>
            <p className="text-2xl font-bold text-sky-700">{limits.min} – {limits.max}</p>
            <p className="text-sm text-gray-400 mt-1">Acceptable limit</p>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-sky-100">
            <p className="text-gray-500 text-sm">Total Readings</p>
            <p className="text-2xl font-bold text-sky-700">{chartData.length}</p>
            <p className="text-sm text-gray-400 mt-1">Last {chartData.length} hours</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-sky-100 p-6">
          <h3 className="font-bold text-sky-800 text-lg mb-4">{activeParam} Trend — Hourly</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0f2fe" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="value" stroke={COLORS[activeParam]} strokeWidth={3} dot={{ r: 5 }} name={activeParam} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-gray-400 py-16">No readings available for this station</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StationReadings;
