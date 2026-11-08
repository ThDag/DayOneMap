import { useRef, useState, type ChangeEvent, type ReactNode } from "react";
import { CircleAlert } from "lucide-react";
import { parseLocations, type LocationEntry } from "../data";

/** Picks a Day One export and reads it in the browser. The file is never sent anywhere. */
export default function ImportButton({
  onImport,
  className,
  children,
}: {
  onImport: (entries: LocationEntry[]) => void;
  className: string;
  children: ReactNode;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // Cleared so that choosing the same file again still fires a change event.
    event.target.value = "";
    if (!file) return;

    setBusy(true);
    setError("");
    try {
      onImport(parseLocations(await file.text()));
    } catch (err) {
      setError(err instanceof Error ? err.message : "That file couldn't be read.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".json,application/json"
        hidden
        onChange={handleFile}
      />
      <button
        type="button"
        disabled={busy}
        aria-busy={busy}
        onClick={() => inputRef.current?.click()}
        className={className}
      >
        {children}
      </button>
      {error && (
        <p role="alert" className="mt-2 flex gap-1.5 text-error">
          <CircleAlert size={14} aria-hidden="true" className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </>
  );
}
