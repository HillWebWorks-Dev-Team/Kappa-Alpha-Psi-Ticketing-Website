"use client";

import { useId, useState } from "react";
import { IconMinus, IconPlus } from "@/components/Icons";

export type FaqItem = {
  question: string;
  answer: string;
};

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const baseId = useId();

  return (
    <div className="faq-list">
      {items.map((item, index) => {
        const panelId = `${baseId}-panel-${index}`;
        const buttonId = `${baseId}-button-${index}`;
        const isOpen = openIndex === index;

        return (
          <div key={item.question} className={`faq-item ${isOpen ? "is-open" : ""}`}>
            <h3 className="faq-item__heading">
              <button
                id={buttonId}
                type="button"
                className="faq-item__trigger"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenIndex(isOpen ? null : index)}
              >
                <span>{item.question}</span>
                {isOpen ? (
                  <IconMinus className="faq-item__icon" />
                ) : (
                  <IconPlus className="faq-item__icon" />
                )}
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              hidden={!isOpen}
              className="faq-item__panel"
            >
              <p>{item.answer}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
