import Link from "next/link";

export type BreadcrumbTrailItem = {
  label: string;
  href?: string;
};

type BreadcrumbTrailProps = {
  items: BreadcrumbTrailItem[];
};

export function BreadcrumbTrail({ items }: BreadcrumbTrailProps) {
  return (
    <nav aria-label="Breadcrumb" className="breadcrumbs">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span className="breadcrumb-item" key={`${item.label}-${index}`}>
            {item.href && !isLast ? (
              <Link className="breadcrumb-link" href={item.href}>
                {item.label}
              </Link>
            ) : (
              <span>{item.label}</span>
            )}
            {!isLast ? <span className="crumb-separator">/</span> : null}
          </span>
        );
      })}
    </nav>
  );
}

