import { useRef } from "react";
import { Icon } from "@/components/icons/Icon";
import { fr } from "@/i18n/fr";

export function Composer({
  value,
  onChange,
  onSend,
  sending,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  sending: boolean;
  disabled?: boolean;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  return (
    <div className="thread__composer">
      <label className="us-sr-only" htmlFor="composer-input">
        {fr.messages.composerLabel}
      </label>
      <textarea
        ref={textareaRef}
        id="composer-input"
        value={value}
        rows={1}
        placeholder={fr.messages.composerPlaceholder}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            onSend();
          }
        }}
        disabled={disabled}
      />
      <button
        type="button"
        className="us-btn us-btn--icon"
        aria-label={fr.messages.send}
        onClick={onSend}
        disabled={disabled || sending || value.trim().length === 0}
      >
        <Icon name="send" size={20} />
      </button>
    </div>
  );
}
