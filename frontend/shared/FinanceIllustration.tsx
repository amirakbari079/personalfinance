/** Decorative artwork; never a measured financial trend. */
export default function FinanceIllustration() {
  return (
    <svg
      className="finance-illustration"
      viewBox="0 0 260 210"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="132"
        cy="107"
        r="90"
        stroke="currentColor"
        strokeOpacity=".12"
      />
      <circle
        cx="132"
        cy="107"
        r="69"
        stroke="currentColor"
        strokeOpacity=".16"
        strokeDasharray="3 8"
      />
      <g className="illustration-rise">
        <path
          d="M55 156V119Q55 113 61 113H84Q90 113 90 119V156"
          fill="currentColor"
          opacity=".25"
        />
        <path
          d="M103 156V85Q103 79 109 79H132Q138 79 138 85V156"
          fill="currentColor"
          opacity=".45"
        />
        <path
          d="M151 156V54Q151 48 157 48H180Q186 48 186 54V156"
          fill="currentColor"
          opacity=".75"
        />
        <path
          d="M45 161H201"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </g>
      <g className="illustration-coin">
        <circle cx="193" cy="138" r="31" fill="var(--finance-gold)" />
        <circle
          cx="193"
          cy="138"
          r="24"
          stroke="var(--finance-ink)"
          strokeOpacity=".3"
        />
        <path
          d="m183 138 7 7 13-15"
          stroke="var(--finance-ink)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <path
        d="m48 55 3-10 3 10 10 3-10 3-3 10-3-10-10-3Z"
        fill="var(--finance-gold)"
      />
      <circle cx="215" cy="64" r="5" fill="currentColor" opacity=".5" />
    </svg>
  )
}
