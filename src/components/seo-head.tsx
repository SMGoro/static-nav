import React from 'react';
import { Website } from '../types/website';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  website?: Website;
  type?: 'website' | 'article' | 'profile';
}

export function SEOHead({ 
  title, 
  description, 
  keywords, 
  image, 
  url, 
  website,
  type = 'website'
}: SEOHeadProps) {
  const pageTitle = title || (website ? `${website.title} - 导航站` : '导航站 - 精选网站导航');
  const pageDescription = description || (website ? website.description : '发现优质网站，精选互联网资源导航');
  const pageKeywords = keywords || (website ? `${website.title},${website.tags.join(',')}` : '网站导航,优质网站,互联网资源');
  const pageImage = image || (website?.screenshots?.[0] || '/favicon.ico');
  const pageUrl = url || (website ? `${window.location.origin}/website/${website.slug || website.id}` : window.location.href);

  return (
    <>
      {/* 基础SEO标签 */}
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <meta name="keywords" content={pageKeywords} />
      <meta name="author" content="导航站" />
      <meta name="robots" content="index, follow" />
      
      {/* Open Graph 标签 */}
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:image" content={pageImage} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="导航站" />
      <meta property="og:locale" content="zh_CN" />
      
      {/* Twitter Card 标签 */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={pageImage} />
      
      {/* 其他重要标签 */}
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#000000" />
      <link rel="canonical" href={pageUrl} />
      
      {/* 结构化数据 */}
      {website && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": website.title,
              "description": website.description,
              "url": website.url,
              "author": {
                "@type": "Organization",
                "name": website.authoredBy || "未知"
              },
              "datePublished": website.addedDate,
              "dateModified": website.lastUpdated || website.addedDate,
              "image": website.screenshots?.[0],
              "aggregateRating": website.rating ? {
                "@type": "AggregateRating",
                "ratingValue": website.rating,
                "reviewCount": website.reviews?.length || 0
              } : undefined,

              "keywords": website.tags.join(', '),
              "inLanguage": website.language || "zh-CN"
            })
          }}
        />
      )}
      
      {/* 网站导航的结构化数据 */}
      {!website && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "导航站",
              "description": "精选优质网站导航，发现互联网优质资源",
              "url": window.location.origin,
              "potentialAction": {
                "@type": "SearchAction",
                "target": {
                  "@type": "EntryPoint",
                  "urlTemplate": `${window.location.origin}/?search={search_term_string}`
                },
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
      )}
    </>
  );
}
