export function StructuredData() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Orça Norte",
    "description": "Plataforma B2B para cotação de materiais de construção e serviços",
    "url": "https://orcanorte.com.br",
    "logo": "https://orcanorte.com.br/logo.png",
    "sameAs": [
      // Adicione aqui suas redes sociais
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
    }
  }

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Orça Norte",
    "url": "https://orcanorte.com.br",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://orcanorte.com.br/explorar?search={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema),
        }}
      />
    </>
  )
}

