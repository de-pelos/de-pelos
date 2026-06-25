import { CONTACT_PHONE_DISPLAY } from "../data/products";

export function SiteFooter() {
  return (
    <footer className="border-t border-[#eadfcd] bg-[#2d2a28] px-5 py-10 text-white">
      <div className="mx-auto grid max-w-7xl gap-6 text-sm sm:grid-cols-[1.4fr_1fr] sm:items-end">
        <div>
          <p className="text-2xl font-black">De Pelos</p>
          <p className="mt-3 font-semibold">Yeison Valencia Bravo</p>
          <p className="text-white/78">Médico Veterinario Zootecnista</p>
        </div>
        <div className="sm:text-right">
          <p className="font-semibold">
            Pedidos y WhatsApp: {CONTACT_PHONE_DISPLAY}
          </p>
          <p className="mt-2 text-white/70">
            Tienda física de mascotas con venta en línea en Colombia.
          </p>
        </div>
      </div>
    </footer>
  );
}
