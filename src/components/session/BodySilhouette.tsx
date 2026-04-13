"use client";

type BodyPart = "head" | "neck" | "shoulder" | "waist" | null;

interface BodySilhouetteProps {
  highlight: BodyPart;
  themeColor: string;
}

export function getHighlightedPart(exerciseName: string): BodyPart {
  if (/肩|肩甲骨|僧帽筋/.test(exerciseName)) return "shoulder";
  if (/首|頸椎|後頭部/.test(exerciseName)) return "neck";
  if (/腰|骨盤|腸腰筋|お尻|臀部/.test(exerciseName)) return "waist";
  if (/目|眼|頭|こめかみ/.test(exerciseName)) return "head";
  return null;
}

export function BodySilhouette({ highlight, themeColor }: BodySilhouetteProps) {
  const dim = "rgba(245,237,216,0.08)";
  const active = themeColor;

  const color = (part: BodyPart) => (highlight === part ? active : dim);
  const glow = (part: BodyPart) =>
    highlight === part ? { filter: `drop-shadow(0 0 6px ${themeColor}80)` } : {};

  return (
    <svg width="72" height="140" viewBox="0 0 72 140" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* 頭 */}
      <ellipse cx="36" cy="16" rx="13" ry="14" fill={color("head")} style={glow("head")} />
      {/* 首 */}
      <rect x="31" y="29" width="10" height="12" rx="4" fill={color("neck")} style={glow("neck")} />
      {/* 肩・上半身 */}
      <path
        d="M10 44 C10 40 20 38 36 38 C52 38 62 40 62 44 L64 74 C64 77 60 79 56 79 L16 79 C12 79 8 77 8 74 Z"
        fill={color("shoulder")}
        style={glow("shoulder")}
      />
      {/* 腰・下半身 */}
      <path
        d="M16 81 L56 81 L60 110 C60 114 54 116 48 116 L24 116 C18 116 12 114 12 110 Z"
        fill={color("waist")}
        style={glow("waist")}
      />
      {/* 脚 */}
      <rect x="20" y="116" width="14" height="22" rx="6" fill={dim} />
      <rect x="38" y="116" width="14" height="22" rx="6" fill={dim} />
    </svg>
  );
}
