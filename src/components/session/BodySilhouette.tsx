"use client";

type BodyPart = "head" | "neck" | "shoulder" | "waist" | null;

interface BodySilhouetteProps {
  highlight: BodyPart;
  typeColor: string;
}

export function getHighlightedPart(exerciseName: string): BodyPart {
  if (/肩|肩甲骨|僧帽筋/.test(exerciseName)) return "shoulder";
  if (/首|頸椎|後頭部/.test(exerciseName)) return "neck";
  if (/腰|骨盤|腸腰筋|お尻|臀部/.test(exerciseName)) return "waist";
  if (/目|眼|頭|こめかみ/.test(exerciseName)) return "head";
  return null;
}

export function BodySilhouette({ highlight, typeColor }: BodySilhouetteProps) {
  const dim = "#DDDDDD";
  const c = (part: BodyPart) => (highlight === part ? typeColor : dim);
  const g = (part: BodyPart): React.CSSProperties =>
    highlight === part ? { filter: `drop-shadow(0 0 6px ${typeColor}80)` } : {};

  return (
    <svg width="72" height="140" viewBox="0 0 72 140" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="36" cy="16" rx="13" ry="14" fill={c("head")} style={g("head")} />
      <rect x="31" y="29" width="10" height="12" rx="4" fill={c("neck")} style={g("neck")} />
      <path
        d="M10 44 C10 40 20 38 36 38 C52 38 62 40 62 44 L64 74 C64 77 60 79 56 79 L16 79 C12 79 8 77 8 74 Z"
        fill={c("shoulder")}
        style={g("shoulder")}
      />
      <path
        d="M16 81 L56 81 L60 110 C60 114 54 116 48 116 L24 116 C18 116 12 114 12 110 Z"
        fill={c("waist")}
        style={g("waist")}
      />
      <rect x="20" y="116" width="14" height="22" rx="6" fill={dim} />
      <rect x="38" y="116" width="14" height="22" rx="6" fill={dim} />
    </svg>
  );
}
