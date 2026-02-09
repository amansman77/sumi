const site = import.meta.env.SITE_URL ?? 'https://sumi.example.com';

export function getStaticPaths() {
  return [{}];
}

export function GET() {
  const sitemapUrl = new URL('sitemap-index.xml', site).href;
  const body = `User-agent: *
Allow: /

Sitemap: ${sitemapUrl}
`;
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
