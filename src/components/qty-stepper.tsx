export function QtyStepper({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (next: number) => void;
  label: string;
}) {
  return (
    <div className="qty" role="group" aria-label={label}>
      <button className="qty__btn" type="button" aria-label="Decrease quantity" onClick={() => onChange(value - 1)}>
        −
      </button>
      <span className="qty__num" aria-live="polite">
        {value}
      </span>
      <button className="qty__btn" type="button" aria-label="Increase quantity" onClick={() => onChange(value + 1)}>
        +
      </button>
    </div>
  );
}
