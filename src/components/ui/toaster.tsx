import { createPortal } from "react-dom";
import { useToast } from "@/hooks/use-toast";
import { X } from "lucide-react";

export function Toaster() {
  const { toasts, dismiss } = useToast();

  // Render nothing if SSR or no root
  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed z-[100] bottom-4 right-4 w-[calc(100%-2rem)] max-w-[420px] space-y-3 sm:space-y-2">
      {toasts.map(({ id, title, description }) => (
        <div
          key={id}
          className="relative flex items-start gap-3 rounded-md border bg-background/95 p-4 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/80"
          role="status"
          aria-live="polite"
        >
          <div className="grid gap-1">
            {title && <div className="text-sm font-semibold text-foreground">{title}</div>}
            {description && <div className="text-sm text-muted-foreground">{description}</div>}
          </div>
          <button
            type="button"
            onClick={() => dismiss(id)}
            aria-label="Close notification"
            className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-md text-foreground/60 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>,
    document.body
  );
}
