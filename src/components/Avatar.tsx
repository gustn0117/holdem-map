// 8 avatar options: 4 roles × 2 genders
// Format: "role-gender" e.g., "dealer-male"

const COLORS = {
  dealer: { bg: "#eafaf1", accent: "#03c75a" },     // 딜러: green (accent)
  serving: { bg: "#dbeafe", accent: "#2563eb" },     // 서빙: blue
  manager: { bg: "#fef3c7", accent: "#d97706" },     // 매니저: amber
  floor: { bg: "#ede9fe", accent: "#7c3aed" },       // 플로어: purple
};

const ROLES = [
  { key: "dealer", label: "딜러" },
  { key: "serving", label: "서빙" },
  { key: "manager", label: "매니저" },
  { key: "floor", label: "플로어" },
];

const GENDERS = [
  { key: "male", label: "남" },
  { key: "female", label: "여" },
];

export const avatarOptions = ROLES.flatMap(r => GENDERS.map(g => ({
  value: `${r.key}-${g.key}`,
  label: `${g.label} ${r.label}`,
  role: r.key,
  gender: g.key,
})));

export function renderAvatar(value: string, size: number = 64) {
  const [role = "dealer", gender = "male"] = value?.split("-") || [];
  const c = COLORS[role as keyof typeof COLORS] || COLORS.dealer;
  const isFemale = gender === "female";

  return (
    <svg width={size} height={size} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="32" fill={c.bg} />
      {/* Body */}
      <path d={isFemale
        ? "M32 38 C22 38 14 46 14 56 L14 64 L50 64 L50 56 C50 46 42 38 32 38 Z"
        : "M32 38 C22 38 14 46 14 54 L14 64 L50 64 L50 54 C50 46 42 38 32 38 Z"}
        fill={c.accent} />
      {/* Shirt collar for role */}
      <path d="M24 40 L32 50 L40 40" fill="none" stroke="#fff" strokeWidth="1.5" opacity="0.4" />
      {/* Head */}
      <circle cx="32" cy="26" r="11" fill="#fcd9b8" />
      {/* Hair */}
      {isFemale ? (
        <>
          <path d="M20 24 C20 16 26 12 32 12 C38 12 44 16 44 24 L44 30 C44 30 42 28 42 26 C40 28 36 28 32 28 C28 28 24 28 22 26 C22 28 20 30 20 30 Z" fill="#3a2817" />
          <path d="M20 28 L18 38 L22 36 L22 28 Z M44 28 L46 38 L42 36 L42 28 Z" fill="#3a2817" />
        </>
      ) : (
        <path d="M21 24 C21 16 27 12 32 12 C37 12 43 16 43 24 L43 20 C43 20 40 21 36 21 C32 21 28 20 26 20 C23 20 21 20 21 20 Z" fill="#3a2817" />
      )}
      {/* Eyes */}
      <circle cx="28" cy="27" r="1.2" fill="#2a1810" />
      <circle cx="36" cy="27" r="1.2" fill="#2a1810" />
      {/* Mouth */}
      <path d="M29 32 Q32 34 35 32" stroke="#2a1810" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      {/* Role badge */}
      <circle cx="50" cy="50" r="9" fill={c.accent} stroke="#fff" strokeWidth="2" />
      <text x="50" y="53.5" fontSize="9" fontWeight="900" fill="#fff" textAnchor="middle" fontFamily="system-ui">
        {role === "dealer" ? "D" : role === "serving" ? "S" : role === "manager" ? "M" : "F"}
      </text>
    </svg>
  );
}

export function AvatarPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {avatarOptions.map(opt => (
        <button key={opt.value} type="button" onClick={() => onChange(opt.value)}
          className={`p-2 rounded-xl border-2 transition-all ${value === opt.value ? "border-accent bg-accent/5" : "border-border-custom bg-white hover:border-accent/30"}`}>
          <div className="flex justify-center mb-1">{renderAvatar(opt.value, 52)}</div>
          <p className="text-center text-[11px] font-semibold text-sub">{opt.label}</p>
        </button>
      ))}
    </div>
  );
}
