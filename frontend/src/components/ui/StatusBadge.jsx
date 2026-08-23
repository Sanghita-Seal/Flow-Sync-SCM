import { STATUS_TONE, TONE_STYLES } from "../../utils/constants";

export default function StatusBadge({ status }) {
  const tone = STATUS_TONE[status] || "slate";
  const t = TONE_STYLES[tone];

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${t.bg} ${t.text}`}>
      {status}
    </span>
  );
}
