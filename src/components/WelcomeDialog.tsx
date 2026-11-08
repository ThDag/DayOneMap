import { useEffect, useRef, useState, type MouseEvent } from "react";
import {
  ChevronRight,
  ExternalLink,
  FileUp,
  LockKeyhole,
  X,
} from "lucide-react";
import type { LocationEntry } from "../data";
import { Fact, IconButton } from "./DetailsPanel";
import ImportButton from "./ImportButton";

const SEEN_KEY = "dayonemap:welcome-seen";
const REPO_URL = "https://github.com/ThDag/DayOneMap";
const EXPORT_GUIDE_URL = `${REPO_URL}/blob/main/docs/how-to-export-dayone-data.md`;
const LINK_CLASS =
  "font-medium text-ink underline decoration-dim underline-offset-2 transition-colors hover:decoration-ink";

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

export default function WelcomeDialog({
  onImport,
}: {
  onImport: (entries: LocationEntry[]) => void;
}) {
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
      className="m-auto w-[40rem] max-w-[calc(100%-1.5rem)] rounded-lg border border-line bg-surface p-0 text-ink shadow-lg shadow-black/40 backdrop:bg-black/40 focus-visible:outline-none"
    >
      <div>
        <header className="flex items-start gap-1 p-2 pl-4">
          <h2 id="welcome-title" className="min-w-0 flex-1 py-1 font-semibold">
            DayOneMap
          </h2>
          <IconButton label="Close" onClick={close}>
            <X size={16} />
          </IconButton>
        </header>

        <p className="px-4 pb-3 text-pretty">
          Day One can log the places you go and how long you stay there, but
          the app has no map showing all of that history at once. DayOneMap
          plots it for you.
        </p>

        <div className="px-4 pb-3">
          <ImportButton
            onImport={(entries) => {
              onImport(entries);
              close();
            }}
            className="group flex w-full items-center gap-3 rounded-md bg-raised p-2.5 text-left transition-colors hover:bg-line disabled:opacity-60"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-ink text-ground transition-colors group-hover:bg-white">
              <FileUp size={16} aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-medium">Import your data</span>
              <span className="block text-dim">
                Choose the JSON file you exported from Day One
              </span>
            </span>
            <ChevronRight
              size={14}
              aria-hidden="true"
              className="shrink-0 text-dim"
            />
          </ImportButton>

          <div className="mt-3 flex gap-2.5 text-dim">
            <LockKeyhole size={14} aria-hidden="true" className="mt-0.5 shrink-0" />
            <p className="text-pretty">
              <strong className="font-semibold text-ink">
                Your file never leaves this browser.
              </strong>{" "}
              DayOneMap reads it on your device and doesn't save it, so
              reloading clears it. There's no account or analytics. The only
              outside requests are map images for the area you're viewing. The
              code is open source under the MIT license, so you can{" "}
              <a
                href={REPO_URL}
                target="_blank"
                rel="noreferrer"
                className={LINK_CLASS}
              >
                check all of this on GitHub
              </a>
              .
            </p>
          </div>
        </div>

        <dl className="px-4">
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
              className={`inline-flex items-baseline gap-1 ${LINK_CLASS}`}
            >
              export guide
              <ExternalLink
                size={12}
                aria-hidden="true"
                className="self-center text-dim"
              />
            </a>
            , then import the file above.
          </Fact>
          <Fact label="Sample data">
            Without an export, the map shows made-up sample data.
          </Fact>
        </dl>

        <div className="border-t border-line p-1">
          <button
            type="button"
            onClick={close}
            className="h-8 w-full rounded-md text-dim transition-colors hover:bg-raised hover:text-ink"
          >
            Open the map
          </button>
        </div>
      </div>
    </dialog>
  );
}
