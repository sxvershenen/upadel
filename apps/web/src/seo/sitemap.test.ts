import assert from 'node:assert/strict'
import test from 'node:test'
import { escapeXML, includeSitemapURL, sitemapCanonicalURL } from './sitemap'

test('sitemap helpers escape XML and normalize self canonical URLs', () => {
  assert.equal(escapeXML(`https://x.test/a?x=1&y=<tag>`), 'https://x.test/a?x=1&amp;y=&lt;tag&gt;')
  assert.equal(sitemapCanonicalURL('/blog', 'https://club.test'), 'https://club.test/blog/')
  assert.equal(includeSitemapURL({ path: '/blog', canonical: 'https://club.test/blog/' }, 'https://club.test'), true)
  assert.equal(includeSitemapURL({ path: '/blog', canonical: 'https://other.test/story' }, 'https://club.test'), false)
})
