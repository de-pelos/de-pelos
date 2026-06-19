import { buildWhatsAppHref } from "../data/products";

export function FloatingContact() {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      <a
        className="flex h-14 min-w-14 items-center justify-center rounded-full bg-[#1f9d55] px-5 text-sm font-extrabold text-white shadow-lg shadow-emerald-900/20 transition hover:bg-[#178348] focus:outline-none focus:ring-4 focus:ring-emerald-200"
        href={buildWhatsAppHref()}
        rel="noreferrer"
        target="_blank"
        aria-label="Abrir WhatsApp de De Pelos"
      >
        WA
      </a>
    </div>
  );
}
