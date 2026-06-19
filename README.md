# De Pelos Tienda Online

Tienda responsive para la tienda fisica de mascotas De Pelos en Colombia. Incluye catalogo, filtros por categoria, buscador, carrito basico, paginas de producto y checkout por WhatsApp.

## Contacto configurado

- Yeison Valencia Bravo
- Medico Veterinario Zootecnista
- Pedidos y WhatsApp: `+57 314 635 8724`
- Contacto zootecnista: `+57 313 655 2259`
- WhatsApp directo: `https://wa.me/573146358724`

## Editar productos

La data vive en `app/data/products.ts`. Cada producto usa estos campos:

```ts
id, nombre, categoria, subcategoria, presentacion, precioCOP, imagen, disponible
```

Para precio pendiente usa `precioCOP: null`; el sitio mostrara `Consultar precio`.

## Imagenes

Las fotos visibles del catalogo estan en `public/assets/products/`, que se sirve como `/assets/products/`.

Usa nombres en kebab-case, por ejemplo:

```txt
agility-gold-gatos-adultos-3kg.jpg
```

Si un producto todavia no tiene foto, deja:

```ts
imagen: placeholderProductImage
```

El logo esta en `public/assets/brand/de-pelos-logo.png`.

## Comandos

```bash
npm run dev
npm run build
```

Este proyecto usa el starter vinext de Sites y queda listo para generar build compatible con Cloudflare Workers/Sites.
