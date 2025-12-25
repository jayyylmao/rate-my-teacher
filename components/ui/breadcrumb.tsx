import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  variant?: "light" | "dark";
}

export default function Breadcrumb({ items, variant = "dark" }: BreadcrumbProps) {
  const linkClass = variant === "light"
    ? "text-blue-100 hover:text-white transition-colors"
    : "text-gray-600 hover:text-blue-600 transition-colors";

  const currentClass = variant === "light"
    ? "text-white font-medium"
    : "text-gray-900 font-medium";

  const chevronClass = variant === "light"
    ? "text-blue-200"
    : "text-gray-400";

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex items-center gap-2 text-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={index} className="flex items-center gap-2">
              {!isLast && item.href ? (
                <Link
                  href={item.href}
                  className={linkClass}
                >
                  {item.label}
                </Link>
              ) : (
                <span className={currentClass}>{item.label}</span>
              )}
              {!isLast && (
                <svg
                  className={`w-4 h-4 ${chevronClass}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
