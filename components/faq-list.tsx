import type { FaqItem } from "@/lib/site";

type FaqListProps = {
  title?: string;
  items: FaqItem[];
};

export function FaqList({ title = "Frequently asked questions", items }: FaqListProps) {
  return (
    <section className="section section-tight">
      <div className="container">
        <h2>{title}</h2>
        <div className="faq-list">
          {items.map((item) => (
            <details className="faq-item" key={item.question}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

