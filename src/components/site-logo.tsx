interface SiteLogoProps {
  height?: number;
}

export function SiteLogo({ height = 40 }: SiteLogoProps) {
  return (
    <a href="/" style={{ display: 'block', textDecoration: 'none' }}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 380 90"
        width={height * (380 / 90)}
        height={height}
        aria-label="Aivify"
        role="img"
        style={{ display: 'block' }}
      >
        <style>
          {`
            @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@700&display=swap');
            .aivify-wordmark {
              font-family: 'Libre Baskerville', serif;
              font-weight: 700;
              font-size: 62px;
              letter-spacing: -0.01em;
            }
            @media (prefers-color-scheme: light) {
              .aivify-wordmark { fill: #1a1a1a; }
            }
            @media (prefers-color-scheme: dark) {
              .aivify-wordmark { fill: #ffffff; }
            }
          `}
        </style>
        <text
          x="50%"
          y="50%"
          dominantBaseline="central"
          textAnchor="middle"
          className="aivify-wordmark"
        >
          Aivify
        </text>
      </svg>
    </a>
  );
}
