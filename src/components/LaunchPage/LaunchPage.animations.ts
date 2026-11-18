// Keep the tracker independent: decorative motion must never block the clocks.
const media = matchMedia('(prefers-reduced-motion: reduce)')

async function initializeMotion() {
  if (media.matches) return

  try {
    const [{ gsap }, { ScrollTrigger }] = await Promise.all([
      import('gsap'),
      import('gsap/ScrollTrigger')
    ])

    gsap.registerPlugin(ScrollTrigger)
    const context = gsap.matchMedia()

    context.add('(prefers-reduced-motion: no-preference)', () => {
      // The artwork leads, the copy follows. The numerical data stays still.
      gsap.from('.hero-copy', {
        opacity: 0,
        y: 24,
        duration: 0.9,
        ease: 'power3.out',
        clearProps: 'all'
      })
      gsap.to('.hero-background', {
        yPercent: 12,
        scale: 1.08,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 1
        }
      })
      gsap.to('.hero-game-logo', {
        scale: 1.14,
        opacity: 0.1,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: '70% top',
          scrub: 0.7
        }
      })

      for (const element of document.querySelectorAll(
        '.section-top, .world-overview, .steps, .faq'
      )) {
        gsap.from(element, {
          y: 24,
          opacity: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: { trigger: element, start: 'top 92%', once: true },
          clearProps: 'all'
        })
      }

      const heading = document.querySelector<HTMLElement>('.word-reveal')

      if (heading) {
        // Preserve accessible text while creating independent word masks.
        const lines = heading.innerText.split('\n').filter(Boolean)

        heading.setAttribute('aria-label', lines.join(' '))
        heading.replaceChildren(
          ...lines.flatMap((line, index) => {
            const words = line
              .trim()
              .split(/\s+/)
              .map(word => {
                const span = document.createElement('span')

                span.textContent = `${word} `
                span.setAttribute('aria-hidden', 'true')

                return span
              })

            return index ? [document.createElement('br'), ...words] : words
          })
        )
        gsap.fromTo(
          heading.querySelectorAll('span'),
          { opacity: 0.3 },
          {
            opacity: 1,
            ease: 'power2.out',
            stagger: { each: 0.12, ease: 'power1.out' },
            scrollTrigger: {
              trigger: heading,
              start: 'top 78%',
              end: 'top 35%',
              scrub: 0.5
            }
          }
        )
      }
    })
    window.addEventListener('pagehide', () => context.revert(), { once: true })
  } catch (error) {
    // Progressive enhancement: all content remains visible when motion fails.
    console.warn('La animación no pudo iniciarse.', error)
  }
}

void initializeMotion()
