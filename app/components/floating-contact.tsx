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
        <svg
          className="h-6 w-6"
          viewBox="0 0 32 32"
          aria-hidden="true"
          focusable="false"
        >
          <path
            fill="currentColor"
            d="M16.01 3.2A12.7 12.7 0 0 0 3.29 15.88c0 2.24.59 4.42 1.71 6.35L3.2 28.8l6.73-1.77a12.67 12.67 0 0 0 6.08 1.55h.01A12.7 12.7 0 0 0 28.8 15.9 12.74 12.74 0 0 0 16.01 3.2Zm0 23.22h-.01a10.52 10.52 0 0 1-5.36-1.47l-.38-.23-3.99 1.05 1.06-3.89-.25-.4a10.47 10.47 0 0 1-1.61-5.6A10.54 10.54 0 0 1 16 5.37a10.59 10.59 0 0 1 10.58 10.52 10.54 10.54 0 0 1-10.57 10.53Zm5.78-7.88c-.32-.16-1.87-.92-2.16-1.03-.29-.1-.5-.16-.71.16-.21.31-.82 1.03-1.01 1.23-.18.21-.37.24-.69.08-.32-.16-1.34-.49-2.56-1.57-.95-.84-1.59-1.89-1.77-2.2-.18-.32-.02-.49.14-.65.14-.14.32-.37.47-.55.16-.18.21-.32.32-.53.1-.21.05-.4-.03-.55-.08-.16-.71-1.71-.98-2.35-.26-.62-.52-.54-.71-.55h-.61c-.21 0-.55.08-.84.4-.29.31-1.11 1.08-1.11 2.64s1.14 3.06 1.3 3.27c.16.21 2.24 3.42 5.43 4.8.76.33 1.35.52 1.81.67.76.24 1.45.21 2 .13.61-.09 1.87-.76 2.13-1.5.26-.74.26-1.37.18-1.5-.08-.13-.29-.21-.61-.37Z"
          />
        </svg>
      </a>
    </div>
  );
}
