import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin/', '/loja/', '/checkout/', '/subscription/'],
    },
    sitemap: 'https://orcanorte.com.br/sitemap.xml',
  }
}

