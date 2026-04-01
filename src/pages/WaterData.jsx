import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const WHO_STANDARDS = {
  "pH": { min: 6.5, max: 8.5, unit: "pH" },
  "Turbidity": { min: 0, max: 4, unit: "NTU" },
  "Dissolved Oxygen": { min: 5, max: 99, unit: "mg/L" },
};

const getStatus = (parameter, value) => {
  const std = Object.keys(WHO_STANDARDS).find(k => parameter.includes(k));
  if (!std) return "unknown";
  const v = parseFloat(value);
  const { min, max } = WHO_STANDARDS[std];
  return v >= min && v <= max ? "safe" : "unsafe";
};

const WaterData = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState("");

  useEffect(() => {
    fetch("http://127.0.0.1:8000/water-data/usgs")
      .then(res => res.json())
      .then(result => {
        setData(result.data || []);
        setSource(result.source);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex bg-sky-50 font-sans">
      <div className="w-64 bg-sky-600 text-white flex flex-col p-6 shadow-xl">
        <h2 className="text-2xl font-bold mb-8 italic">💧 WQM</h2>
        <ul className="space-y-2 flex-1">
          <li onClick={() => navigate("/dashboard")} className="hover:bg-sky-500 p-3 rounded-lg cursor-pointer">🏠 Dashboard</li>
          <li onClick={() => navigate("/map")} className="hover:bg-sky-500 p-3 rounded-lg cursor-pointer">📍 Live Map</li>
          <li onClick={() => navigate("/reports")} className="hover:bg-sky-500 p-3 rounded-lg cursor-pointer">📊 Reports</li>
          <li className="bg-white text-sky-600 p-3 rounded-lg font-bold shadow-md">🌊 Water Data</li>
        </ul>
        <div className="mt-8 bg-sky-700 rounded-xl p-4 text-xs">
          <p className="font-bold mb-2">WHO Standards</p>
          <p>🟢 pH: 6.5 - 8.5</p>
          <p>🟢 Turbidity: &lt; 4 NTU</p>
          <p>🟢 DO: &gt; 5 mg/L</p>
        </div>
      </div>
      <div className="flex-1 p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-sky-900">Live Water Quality Data</h1>
          <p className="text-sky-600 font-medium">Source: <span className="font-bold">{source}</span></p>
        </header>
        {loading ? (
          <div className="text-center text-sky-600 text-xl mt-20">Loading data...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data.map((item, i) => {
              const status = getStatus(item.parameter, item.value);
              return (
                <div key={i} className={`bg-white rounded-2xl shadow-sm border-2 p-6 ${status === "safe" ? "border-green-300" : status === "unsafe" ? "border-red-300" : "border-sky-100"}`}>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-sky-800 text-lg">{item.site_name}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full font-bold ${status === "safe" ? "bg-green-100 text-green-700" : status === "unsafe" ? "bg-red-100 text-red-700" : "bg-sky-100 text-sky-600"}`}>
                      {status === "safe" ? "✅ Safe" : status === "unsafe" ? "⚠️ Unsafe" : "📡 " + item.source}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500 text-sm">Parameter</span>
                      <span className="font-bold text-slate-700">{item.parameter}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-sm">Value</span>
                      <span className={`font-black text-2xl ${status === "safe" ? "text-green-600" : status === "unsafe" ? "text-red-600" : "text-sky-700"}`}>
                        {item.value} <span className="text-sm font-normal">{item.unit}</span>
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 text-sm">Recorded</span>
                      <span className="text-slate-500 text-sm">{item.recorded_at?.slice(0,10)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 text-sm">Location</span>
                      <span className="text-slate-500 text-sm">{item.latitude?.toFixed(3)}, {item.longitude?.toFixed(3)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default WaterData;
