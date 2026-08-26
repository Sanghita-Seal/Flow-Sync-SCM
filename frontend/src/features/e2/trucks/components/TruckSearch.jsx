import { useState } from "react";

export default function TruckSearch({ onSearch, placeholder = "Search by tracking number, trailer ID, or shipment ref" }) {
  const [value, setValue] = useState("");

  function handleChange(e) {
    setValue(e.target.value);
    onSearch(e.target.value);
  }

  return (
    <input
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      className="w-full max-w-md rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
    />
  );
}
