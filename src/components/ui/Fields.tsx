import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { Icon } from "@/components/icons/Icon";
import { fr } from "@/i18n/fr";

type FieldShellProps = {
  label: string;
  optional?: boolean;
  hint?: string;
  error?: string;
  htmlFor: string;
  hintId?: string;
  errorId?: string;
  children: ReactNode;
};

function FieldShell({
  label,
  optional,
  hint,
  error,
  htmlFor,
  hintId,
  errorId,
  children,
}: FieldShellProps) {
  return (
    <div className="us-field">
      <label className="us-field__label" htmlFor={htmlFor}>
        {label}
        {optional ? (
          <span className="us-field__optional">({fr.common.optional})</span>
        ) : null}
      </label>
      {children}
      {hint && !error ? (
        <p className="us-field__hint" id={hintId}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p className="us-field__error" id={errorId} role="alert">
          <Icon name="alert" size={16} />
          {error}
        </p>
      ) : null}
    </div>
  );
}

type TextFieldProps = {
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "className">;

export function TextField({
  label,
  hint,
  error,
  optional,
  id,
  ...rest
}: TextFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const hintId = hint ? `${fieldId}-hint` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;

  return (
    <FieldShell
      label={label}
      optional={optional}
      hint={hint}
      error={error}
      htmlFor={fieldId}
      hintId={hintId}
      errorId={errorId}
    >
      <input
        id={fieldId}
        className="us-input"
        aria-invalid={error ? true : undefined}
        aria-describedby={[errorId, hintId].filter(Boolean).join(" ") || undefined}
        {...rest}
      />
    </FieldShell>
  );
}

type TextareaFieldProps = {
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  counter?: { current: number; max: number };
} & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "className">;

export function TextareaField({
  label,
  hint,
  error,
  optional,
  counter,
  id,
  ...rest
}: TextareaFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const hintId = hint ? `${fieldId}-hint` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;

  return (
    <FieldShell
      label={label}
      optional={optional}
      hint={hint}
      error={error}
      htmlFor={fieldId}
      hintId={hintId}
      errorId={errorId}
    >
      <textarea
        id={fieldId}
        className="us-textarea"
        aria-invalid={error ? true : undefined}
        aria-describedby={[errorId, hintId].filter(Boolean).join(" ") || undefined}
        {...rest}
      />
      {counter ? (
        <span className="us-field__counter" aria-hidden="true">
          {fr.publish.charCount(counter.current, counter.max)}
        </span>
      ) : null}
    </FieldShell>
  );
}

type SelectFieldProps = {
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  placeholder?: string;
  options: Array<{ value: string; label: string }>;
} & Omit<SelectHTMLAttributes<HTMLSelectElement>, "className" | "children">;

export function SelectField({
  label,
  hint,
  error,
  optional,
  placeholder,
  options,
  id,
  ...rest
}: SelectFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const hintId = hint ? `${fieldId}-hint` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;

  return (
    <FieldShell
      label={label}
      optional={optional}
      hint={hint}
      error={error}
      htmlFor={fieldId}
      hintId={hintId}
      errorId={errorId}
    >
      <div className="us-select-wrap">
        <select
          id={fieldId}
          className="us-select"
          aria-invalid={error ? true : undefined}
          aria-describedby={[errorId, hintId].filter(Boolean).join(" ") || undefined}
          {...rest}
        >
          {placeholder ? <option value="">{placeholder}</option> : null}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <Icon
          name="chevron-down"
          size={20}
          className="us-select-wrap__icon"
        />
      </div>
    </FieldShell>
  );
}
