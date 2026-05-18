"use client";

import { useRouter } from "next/navigation";
import { SiteLogo } from "@/components/site-logo";

interface LogoProps {
  onClick?: () => void;
}

export function Logo({ onClick }: LogoProps) {
  const router = useRouter();
  const handleClick = () => {
    router.push("/");
    onClick?.();
  };

  return (
    <button
      onClick={handleClick}
      onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.8'; }}
      onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: 0,
        display: "flex",
        alignItems: "center",
        flexShrink: 0,
        transition: "opacity 0.2s ease",
      }}
      aria-label="Aivify home"
    >
      <SiteLogo height={30} />
    </button>
  );
}

