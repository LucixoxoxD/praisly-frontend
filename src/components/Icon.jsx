const paths = {
  star: "m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9Z",
  arrow: "M4 12h16m-6-6 6 6-6 6",
  external:
    "M14 3h7v7m0-7L10 14M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5",
  check: "m5 12 4 4L19 6",
  edit: "m16 3 5 5-12 12-6 1 1-6Zm-2 2 5 5",
  copy: "M9 8h11v13H9ZM15 8V3H4v13h5",
  refresh: "M20 7v5h-5m5 0a8 8 0 1 0-2 6",
  shield: "m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6Zm-4 9 3 3 5-6",
  quote: "M10 6H3v8h5v4M21 6h-7v8h5v4",
  chart: "M4 3v18h17M8 16v-4m5 4V8m5 8V5",
  message: "M21 5H3v13h5l4 3 4-3h5ZM7 9h10M7 13h6",
  qr: "M3 3h6v6H3ZM15 3h6v6h-6ZM3 15h6v6H3ZM15 15h2v2h-2Zm6 0v6h-6",
  settings:
    "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0-6v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2",
  card: "M3 5h18v14H3Zm0 5h18M7 15h4",
};
export default function Icon({ name, size = 18, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d={paths[name] || paths.star} />
    </svg>
  );
}
