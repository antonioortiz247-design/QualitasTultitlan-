import { siteConfig } from '@/config/site';
export function JsonLd(){const data={ '@context':'https://schema.org','@type':'WebSite',name:siteConfig.businessName,url:siteConfig.url,potentialAction:{'@type':'ContactAction',name:'Solicitar cotización'}};return <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(data)}}/>}
