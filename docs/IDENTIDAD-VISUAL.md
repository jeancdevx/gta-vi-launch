# Identidad visual de GTA VI

Investigación del 18 de noviembre de 2026. Proyecto de fans.

## Fuentes primarias y referencia técnica

- Sitio de Rockstar: https://www.rockstargames.com/VI
- Galería y descargas: https://www.rockstargames.com/VI/media
- Horarios publicados:
  https://support.rockstargames.com/articles/29jV3Cv2cCgvwM1XgtMO5o/grand-theft-auto-vi-regional-pre-load-and-release-times-on-playstation-5-and-xbox-series-x-or-s
- Implementación educativa en Astro y GSAP:
  https://github.com/midudev/landing-gta-vi

## Dirección de arte

Portada cinematográfica de Jason y Lucia, fotografía cálida de Leonida, siluetas
tropicales y tratamiento editorial Art Deco. La interfaz permite consultar
horarios sin interrumpir la lectura de los datos. El mapa de puntos es una
ilustración, no un mapa político.

La paleta de implementación está inspirada en el arte de Rockstar, no es una
declaración de sus tokens oficiales:

| Token      | Valor     | Uso                            |
| ---------- | --------- | ------------------------------ |
| Fondo      | `#111019` | Tinta violeta profunda         |
| Superficie | `#191722` | Tarjetas de regiones           |
| Texto      | `#fff6ef` | Blanco cálido                  |
| Acento     | `#f5a5c6` | Rosa de Vice City              |
| Luz        | `#ffccad` | Melocotón del atardecer        |
| Disponible | `#b8e5c1` | Estado de medianoche alcanzada |

## Tipografía

El logotipo usa el asset del juego, no texto que pretende imitarlo. La
tipografía de interfaz se obtiene del directorio `public/fonts` de la referencia
de Midudev. El sincronizador descubre los nombres reales, conserva los
originales y crea alias estables para las caras regular y bold. No se afirma una
identificación tipográfica exacta hasta verificar los archivos descargados. El
fallback actual es Manrope local o la tipografía del sistema.

`src/helpers/assets.helpers.ts` es el inventario ejecutable. Hay 10 recursos
identificados: arte de portada, portada con logo, logo apilado, monograma VI,
logo completo, logos de PS5 y Xbox, y tres imágenes de la galería oficial. Las
URLs del sitio de Rockstar incluyen hashes que pueden cambiar: actualizar el
inventario si dejan de existir.

## Descarga y comprobación

```sh
pnpm assets:sync
```

El comando descarga los recursos, comprueba el tipo de imagen y la firma de los
archivos de fuente, y genera un informe con tamaño y SHA256. Un error de
descarga queda marcado como `pending` y devuelve código de salida distinto de
cero. El frontend usa el archivo local cuando existe y, para imágenes, la URL
original en caso contrario. Las fuentes solo se activan si existen localmente.

Las imágenes y fuentes ya están descargadas en `public/`. El informe registra 14
recursos locales y cero pendientes. Las caras elegidas son `gta-regular.woff` y
`gta-bold.woff`; también se conserva `gta-semibold.woff`. El primer intento
estuvo bloqueado por la red, pero la descarga se completó cuando el entorno
habilitó el acceso.

## Movimiento

| Elemento                  | Papel      | Inicio              | Duración              | Tratamiento                                     |
| ------------------------- | ---------- | ------------------- | --------------------- | ----------------------------------------------- |
| Bloque del hero           | Principal  | Entrada             | 900 ms                | Opacidad y elevación de 24 px                   |
| Arte de portada           | Decoración | Scroll del hero     | Controlado por scroll | Traslación y escala con ScrollTrigger           |
| Logo del hero             | Apoyo      | Scroll del hero     | Controlado por scroll | Escala y desvanecimiento                        |
| Cabeceras de sección      | Apoyo      | Entrada al viewport | 800 ms                | Opacidad y elevación leve                       |
| Tagline sobre arte        | Principal  | Scroll del bloque   | Controlado por scroll | Revelado por palabra                            |
| Datos, filtros y tarjetas | Función    | Inmediato           | Sin secuencias        | Consulta estable, contadores sin desplazamiento |

Los efectos de scroll usan GSAP ScrollTrigger. Los controles usan transiciones
CSS de 160–200 ms con curvas de Emil. La preferencia de movimiento reducido
elimina el desplazamiento y las secuencias. No hay audio ni video automático, ni
scroll secuestrado. Verificar el ritmo y contraste con el arte descargado antes
de publicar.

## Derechos y atribución

Los logos, ilustraciones y fuentes del juego pertenecen a sus titulares. La
disponibilidad de un asset en la web o en un repositorio educativo no concede
una licencia adicional. La página incluye atribución y se presenta como proyecto
no oficial. Las skills conservan su licencia MIT y sus autores en sus
directorios locales.
