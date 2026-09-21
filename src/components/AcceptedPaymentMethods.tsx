import {
  getAcceptedPaymentMethods,
  type PaymentMethodId,
} from "@/lib/payment-methods";

type Props = {
  methods?: PaymentMethodId[];
  className?: string;
};

export function AcceptedPaymentMethods({
  methods,
  className = "",
}: Props) {
  const items = getAcceptedPaymentMethods(methods);
  if (items.length === 0) return null;

  return (
    <div className={`accepted-payments ${className}`.trim()}>
      <h3 className="accepted-payments__title">Accepted Payment Methods</h3>
      <ul className="accepted-payments__list" aria-label="Accepted payment methods">
        {items.map((method) => (
          <li key={method.id} className="accepted-payments__item">
            <span className="accepted-payments__badge">
              <img
                src={method.src}
                alt={method.label}
                width={48}
                height={24}
                className="accepted-payments__logo"
                decoding="async"
              />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
