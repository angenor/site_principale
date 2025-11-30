export function useJsonLd() {
  const config = useRuntimeConfig()
  const siteUrl = config.public.siteUrl || 'https://mom.transparency.mg'

  // Organisation (pour toutes les pages)
  const setOrganizationSchema = () => {
    useHead({
      script: [{
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'Observatoire des Mines de Madagascar',
          alternateName: 'MOM',
          url: siteUrl,
          logo: `${siteUrl}/images/logos/logo_fond_bleu_texte_blanc.jpeg`,
          description: 'L\'Observatoire des Mines de Madagascar surveille la gouvernance, la transparence et la durabilité dans la gestion des ressources minières à Madagascar.',
          foundingDate: '2024',
          address: {
            '@type': 'PostalAddress',
            addressLocality: 'Antananarivo',
            addressCountry: 'MG'
          },
          parentOrganization: [
            {
              '@type': 'Organization',
              name: 'Transparency International - Initiative Madagascar',
              alternateName: 'TIMG',
              url: 'https://transparency.mg'
            },
            {
              '@type': 'Organization',
              name: 'Publiez Ce Que Vous Payez Madagascar',
              alternateName: 'PCQVP',
              url: 'https://pcqvp.mg'
            }
          ]
        })
      }]
    })
  }

  // Article (pour les études de cas et actualités)
  const setArticleSchema = (article: {
    title: string
    description: string
    image?: string
    datePublished: string
    dateModified?: string
    author?: string
    slug: string
  }) => {
    useHead({
      script: [{
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: article.title,
          description: article.description,
          image: article.image || `${siteUrl}/images/og-image.jpg`,
          datePublished: article.datePublished,
          dateModified: article.dateModified || article.datePublished,
          author: {
            '@type': 'Organization',
            name: article.author || 'Observatoire des Mines de Madagascar'
          },
          publisher: {
            '@type': 'Organization',
            name: 'Observatoire des Mines de Madagascar',
            logo: {
              '@type': 'ImageObject',
              url: `${siteUrl}/images/logos/logo_fond_bleu_texte_blanc.jpeg`
            }
          },
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `${siteUrl}${article.slug}`
          }
        })
      }]
    })
  }

  // Breadcrumb
  const setBreadcrumbSchema = (items: { name: string; url: string }[]) => {
    useHead({
      script: [{
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: `${siteUrl}${item.url}`
          }))
        })
      }]
    })
  }

  // Website (pour la page d'accueil)
  const setWebsiteSchema = () => {
    useHead({
      script: [{
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'Observatoire des Mines de Madagascar',
          alternateName: 'MOM',
          url: siteUrl,
          potentialAction: {
            '@type': 'SearchAction',
            target: {
              '@type': 'EntryPoint',
              urlTemplate: `${siteUrl}/recherche?q={search_term_string}`
            },
            'query-input': 'required name=search_term_string'
          }
        })
      }]
    })
  }

  // FAQPage (pour la page À propos ou FAQ)
  const setFaqSchema = (faqs: { question: string; answer: string }[]) => {
    useHead({
      script: [{
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqs.map(faq => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: faq.answer
            }
          }))
        })
      }]
    })
  }

  return {
    setOrganizationSchema,
    setArticleSchema,
    setBreadcrumbSchema,
    setWebsiteSchema,
    setFaqSchema
  }
}
