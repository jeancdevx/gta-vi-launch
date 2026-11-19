# Propuesta de página

## Estructura y acción principal

Landing breve orientada a la consulta: portada cinematográfica, selector de
región, contador local, mapa mundial, tablero filtrable, creadores por país,
hitos oficiales, explicación de tres pasos, preguntas y créditos. La acción
principal es **Mi región**. No se requiere cuenta.

Hero: **Vice City abre a medianoche.** Durante la ola: **La medianoche ya cruza
el mapa.** Subtítulo: **Elige tu país y sigue la hora local de referencia.**
Señal de confianza: la fecha y los horarios enlazan a Rockstar Support. La
cabecera mantiene solo el logotipo, cuatro enlaces y **Mi región**; no incluye
una tira decorativa con fecha y hora.

Beneficios: consulta el tiempo restante; ve el tiempo transcurrido; cambia de
región sin cálculos manuales; busca países y ciudades; comparte una consulta
mediante su URL.

Tres pasos: encuentra tu región, sigue la cuenta regresiva, el mapa se enciende.

## Preguntas cubiertas

1. Hora de lanzamiento: 19 de noviembre de 2026 a medianoche local según
   Rockstar.
2. Orden entre países: depende de la llegada de medianoche a cada región.
3. Países con varios husos: se indica una ciudad y hay zonas adicionales; manda
   el contador de la tienda de la cuenta.
4. Significado de disponible: se alcanzó el horario calculado, sin verificar una
   consola o licencia.
5. Plataformas: este seguimiento cubre PS5 y Xbox Series X|S.
6. Actualizaciones: cada segundo, usando el reloj del dispositivo.

## SEO

`noindex, follow` mientras siga siendo un proyecto de fans no oficial. Título:
**GTA VI · El mundo entra a Vice City**. Descripción: seguimiento por país y
cuenta regresiva del lanzamiento. Open Graph, favicon y 404 incluidos.

## Elecciones de diseño

Estructura de landing mínima de consulta. Las reglas genéricas de la skill se
subordinan a la estética explícitamente pedida: fondo violeta, arte de Rockstar,
fuentes de referencia, gradientes de legibilidad y navegación discreta. No se
añaden secciones comerciales, métricas ficticias ni testimonios.

## Skills locales

Instaladas como archivos dentro de `.agents/skills`: landing-page-design
(Elaya), emil-design-eng, animate y choreograph (Emil Kowalski), find-skills
(Vercel), web-design-guidelines (Vercel). No se modificó la instalación global.
Se consultó el leaderboard de skills.sh según find-skills y se eligieron las
guías de interfaces de Vercel por su foco en accesibilidad y rendimiento. Se
descartaron skills React porque la interfaz utiliza Astro y TypeScript sin
hidratación de un framework adicional.

La skill de Elaya se copió de la versión disponible en el entorno; las de Emil y
Vercel se recuperaron de sus archivos públicos mediante la herramienta web
porque la terminal no dispone de DNS externo. `pnpm skills:install` permite
reinstalarlas desde sus repositorios cuando haya conexión. Las skills locales
estarán disponibles para el proyecto en el siguiente turno y `AGENTS.md`
documenta cómo usarlas.
