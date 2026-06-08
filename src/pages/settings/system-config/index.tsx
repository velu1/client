import { useState, useEffect, useCallback } from "react";
import { Sun, Calendar, Clock, Loader2 } from "lucide-react";
import { getSystemConfig, updateSystemConfig } from "../../../api/settings";
import { toast } from "react-fox-toast";

const dateFormats = [
  { value: "DD/MM/YYYY", label: "DD/MM/YYYY" },
  { value: "MM/DD/YYYY", label: "MM/DD/YYYY" },
  { value: "YYYY-MM-DD", label: "YYYY-MM-DD" },
  { value: "YYYY/MM/DD", label: "YYYY/MM/DD" },
];

const timeFormats = [
  { value: "12hr", label: "12 Hour (AM/PM)" },
  { value: "24hr", label: "24 Hour" },
];

const SystemConfigPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dateFormat, setDateFormat] = useState("DD/MM/YYYY");
  const [timeFormat, setTimeFormat] = useState("24hr");

  const saveChanges = useCallback(async (newDateFormat: string, newTimeFormat: string) => {
    try {
      setSaving(true);
      const formattedTimeFormat = newTimeFormat === "12hr" ? "hh:mm a" : "hh:mm";
      await updateSystemConfig({ dateFormat: newDateFormat, timeFormat: formattedTimeFormat, theme: "Light" });
      toast.success("Configuration saved");
    } catch {
      toast.error("Failed to save configuration");
    } finally {
      setSaving(false);
    }
  }, []);

  useEffect(() => {
    getSystemConfig()
      .then((data) => {
        setDateFormat(data.dateFormat);
        setTimeFormat(data.timeFormat.includes("a") ? "12hr" : "24hr");
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleDateFormatChange = async (val: string) => {
    setDateFormat(val);
    await saveChanges(val, timeFormat);
  };

  const handleTimeFormatChange = async (val: string) => {
    setTimeFormat(val);
    await saveChanges(dateFormat, val);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-5 h-5 animate-spin text-[#434a52]" />
      </div>
    );
  }

  return (
    <div className="px-4 py-2 max-w-2xl space-y-4">

      {/* Theme */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-[#434a52]/8 flex items-center justify-center shrink-0">
            <Sun size={15} className="text-[#434a52]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">Theme</p>
            <p className="text-xs text-gray-400 mt-0.5">Application visual style</p>
          </div>
        </div>
        <div className="px-5 py-4">
          <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1 gap-1">
            {["Light", "Dark"].map((t) => (
              <button
                key={t}
                disabled
                className={`px-5 py-1.5 rounded-md text-sm font-medium transition-all ${
                  t === "Light"
                    ? "bg-white text-[#434a52] shadow-sm border border-gray-200"
                    : "text-gray-400 cursor-not-allowed"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">Dark mode coming soon</p>
        </div>
      </div>

      {/* Date & Time */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-[#434a52]/8 flex items-center justify-center shrink-0">
            <Calendar size={15} className="text-[#434a52]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">Date &amp; Time Format</p>
            <p className="text-xs text-gray-400 mt-0.5">How dates and times display across the system</p>
          </div>
        </div>
        <div className="px-5 py-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1.5">
              <Calendar size={12} className="text-gray-400" />
              Date Format
            </label>
            <select
              value={dateFormat}
              onChange={(e) => handleDateFormatChange(e.target.value)}
              disabled={saving}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#434a52] focus:ring-2 focus:ring-[#434a52]/15 transition-all bg-white disabled:opacity-50 appearance-none"
            >
              {dateFormats.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1.5">
              <Clock size={12} className="text-gray-400" />
              Time Format
            </label>
            <select
              value={timeFormat}
              onChange={(e) => handleTimeFormatChange(e.target.value)}
              disabled={saving}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#434a52] focus:ring-2 focus:ring-[#434a52]/15 transition-all bg-white disabled:opacity-50 appearance-none"
            >
              {timeFormats.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
        {saving && (
          <div className="px-5 pb-4 flex items-center gap-2 text-xs text-[#434a52] border-t border-gray-50 pt-3">
            <Loader2 size={12} className="animate-spin" />
            Saving changes...
          </div>
        )}
      </div>

    </div>
  );
};

export default SystemConfigPage;
