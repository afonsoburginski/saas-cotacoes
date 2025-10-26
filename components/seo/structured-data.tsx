export function StructuredData() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Orça Norte",
    "description": "Plataforma B2B para cotação de materiais de construção e serviços",
    "url": "https://orca-norte.vercel.app",
    "logo": "https://orca-norte.vercel.app/logo.png",
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
    "url": "https://orca-norte.vercel.app",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://orca-norte.vercel.app/explorar?search={search_term_string}",
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

