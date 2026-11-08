import { useEffect, useRef, useState, type MouseEvent } from "react";
import { ExternalLink, X } from "lucide-react";
import { Fact, IconButton } from "./DetailsPanel";

const SEEN_KEY = "dayonemap:welcome-seen";
const EXPORT_GUIDE_URL =
  "https://github.com/ThDag/DayOneMap/blob/main/docs/how-to-export-dayone-data.md";

// Storage can throw or be empty in private windows, so the popup may show again there.
function hasSeenWelcome() {
  try {
    return localStorage.getItem(SEEN_KEY) !== null;
  } catch {
    return false;
  }
}

function rememberWelcomeSeen() {
  try {
    localStorage.setItem(SEEN_KEY, "1");
  } catch {
    // Nothing to do: the popup just appears again on the next visit.
  }
}

export default function WelcomeDialog() {
  const [show] = useState(() => !hasSeenWelcome());
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (!show || dialogRef.current?.open) return;
    dialogRef.current?.showModal();
    // Focus the dialog itself so no control opens with a focus ring on it.
    dialogRef.current?.focus();
  }, [show]);

  if (!show) return null;

  const close = () => dialogRef.current?.close();

  // Clicks on the backdrop land on the dialog element itself; the content sits in an inner div.
  const closeOnBackdrop = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === dialogRef.current) close();
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="welcome-title"
      tabIndex={-1}
      onClose={rememberWelcomeSeen}
      onClick={closeOnBackdrop}
      className="m-auto w-[40rem] max-w-[calc(100%-1.5rem)] rounded-lg border border-line bg-surface p-0 text-ink shadow-lg shadow-black/40 backdrop:bg-black/50 focus-visible:outline-none"
    >
      <div>
        <header className="flex items-center justify-between gap-1 py-2 pr-2 pl-4 sm:pl-6">
          <h2 id="welcome-title" className="text-lg font-semibold">
            DayOneMap
          </h2>
          <IconButton label="Close" onClick={close}>
            <X size={16} />
          </IconButton>
        </header>

        <p className="px-4 pb-4 text-base text-pretty sm:px-6">
          Day One can log the places you go and how long you stay there, but
          the app has no map showing all of that history at once. DayOneMap
          plots it for you.
        </p>

        <dl className="px-4 pb-1 sm:px-6">
          <Fact label="Works with">
            Day One's location history, an{" "}
            <strong className="font-semibold">iPhone-only</strong> feature you
            have to turn on.
          </Fact>
          <Fact label="Who it's for">
            A <strong className="font-semibold">very niche</strong> tool, made
            for people who use that one feature.
          </Fact>
          <Fact label="Your data">
            Follow the{" "}
            <a
              href={EXPORT_GUIDE_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-baseline gap-1 font-medium text-accent underline underline-offset-2"
            >
              export guide
              <ExternalLink
                size={12}
                aria-hidden="true"
                className="self-center"
              />
            </a>
            , then run DayOneMap locally with that file.
          </Fact>
          <Fact label="Sample data">
            Without an export, the map shows made-up sample data.
          </Fact>
        </dl>

        <div className="border-t border-line p-1">
          <button
            type="button"
            onClick={close}
            className="h-10 w-full rounded-md bg-raised font-medium transition-colors hover:bg-line"
          >
            Open the map
          </button>
        </div>
      </div>
    </dialog>
  );
}
