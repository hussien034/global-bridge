interface LogoProps {
  variant?: "horizontal" | "compact" | "bilingual";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function Logo({ variant = "horizontal", size = "md", className = "" }: LogoProps) {
  const markSizeMap = {
    sm: variant === "compact" ? 32 : 30,
    md: variant === "compact" ? 44 : 36,
    lg: variant === "compact" ? 64 : 48,
  };
  const markSize = markSizeMap[size];

  if (variant === "bilingual") {
    return (
      <img
        src="/images/global-bridge-logo.png"
        alt="Global Bridge — جسر المواهب المصرية"
        className={className}
        style={{ display: "block", width: markSize * 1.2, height: markSize * 1.2, objectFit: "contain" }}
      />
    );
  }

  const mark = (
    <img
      src="/images/global-bridge-mark.png"
      alt=""
      aria-hidden="true"
      width={markSize}
      height={markSize}
      style={{
        display: "block",
        flexShrink: 0,
        objectFit: "contain",
        borderRadius: 8,
        background: "var(--sand-white)",
        padding: 2,
      }}
    />
  );

  if (variant === "compact") {
    return <span className={className} style={{ display: "inline-flex" }}>{mark}</span>;
  }

  return (
    <div
      className={`brand-lockup ${className}`}
      style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: "1px", textDecoration: "none" }}
    >
      {mark}
      <div style={{ textAlign: "center", lineHeight: 1 }}>
        <div
          style={{
            fontFamily: "var(--font-en)",
            fontSize: size === "sm" ? 12 : size === "md" ? 14 : 18,
            fontWeight: 800,
            letterSpacing: "-0.35px",
            lineHeight: 1.05,
          }}
        >
          <span style={{ color: "var(--text-primary)" }}>GLOBAL</span>
          <span style={{ color: "var(--nile-blue)", fontWeight: 700, marginLeft: "3px" }}>BRIDGE</span>
          <span
            aria-hidden="true"
            style={{
              display: "inline-block",
              width: "4px",
              height: "4px",
              borderRadius: "50%",
              background: "var(--egypt-gold)",
              marginRight: "4px",
              verticalAlign: "middle",
            }}
          />
        </div>
        <div style={{ fontSize: size === "sm" ? 8 : size === "md" ? 9 : 11, fontWeight: 700, color: "var(--egypt-gold-text)", letterSpacing: "0.1px", marginTop: "2px" }}>
          جسر المواهب المصرية
        </div>
      </div>
    </div>
  );
}
