# SEO Enhancement Reference

Checklist of SEO improvements for the Core Code HubSpot theme. Focuses on structured data, semantic markup, and technical SEO that the theme controls — not HubSpot-managed meta tags.

**Important:** HubSpot's `{{ standard_header_includes }}` handles canonical URLs, `<meta name="robots">`, Open Graph, and Twitter Card meta. Do NOT duplicate these in theme templates.

---

## Structured Data (JSON-LD)

### 1. Add `Organization` schema to base.html — **High**

**Current state:** No site-wide structured data.

**Fix (add to `templates/layouts/base.html`, inside `<head>`):**
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "{{ site_settings.company_name|default('Company Name') }}",
  "url": "{{ content.absolute_url|split('/')|batch(3)|first|join('/') }}",
  {% if site_settings.company_logo_url %}
  "logo": "{{ site_settings.company_logo_url }}",
  {% endif %}
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer service"
  }
}
</script>
```

**Note:** Use HubSpot `site_settings` variables where available. The URL construction extracts the domain from `content.absolute_url`. Test in HubSpot preview to confirm `site_settings` properties are available.

### 2. Add `WebSite` schema with search to base.html — **Medium**

**Current state:** No WebSite schema. The search module exists (`search_box.module`).

**Fix (add to `base.html` `<head>`, after Organization schema):**
```html
{% set site_url = content.absolute_url|split('/')|batch(3)|first|join('/') %}
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "{{ site_settings.company_name|default('Company Name') }}",
  "url": "{{ site_url }}",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "{{ site_url }}/search?term={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}
</script>
```

**Note:** Verify the search URL pattern matches the actual search results page path in HubSpot.

### 3. Add `BreadcrumbList` schema to breadcrumbs module — **High**

**Current state:** The breadcrumbs module renders HTML breadcrumbs but has no JSON-LD.

**Fix (add to `modules/elements/breadcrumbs.module/module.html`):**
```html
{% if module.breadcrumbs and module.breadcrumbs|length > 0 %}
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {% for crumb in module.breadcrumbs %}
    {
      "@type": "ListItem",
      "position": {{ loop.index }},
      "name": "{{ crumb.label|escape }}",
      {% if crumb.url %}
      "item": "{{ crumb.url }}"
      {% endif %}
    }{% if not loop.last %},{% endif %}
    {% endfor %}
  ]
}
</script>
{% endif %}
```

**Note:** Adapt the `crumb.label` and `crumb.url` references to match the actual field names in the breadcrumbs module's fields.json. Read the module files first to determine the correct field paths — the example above is a template, not final code.

### 4. Add `BlogPosting` schema to blog post template — **High**

**Current state:** No Article/BlogPosting schema.

**Fix (add to `templates/blog_post.html`):**
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "{{ content.name|escape }}",
  "description": "{{ content.meta_description|escape }}",
  "url": "{{ content.absolute_url }}",
  "datePublished": "{{ content.publish_date|datetimeformat('%Y-%m-%dT%H:%M:%S') }}",
  "dateModified": "{{ content.updated|datetimeformat('%Y-%m-%dT%H:%M:%S') }}",
  {% if content.featured_image %}
  "image": "{{ content.featured_image }}",
  {% endif %}
  "author": {
    "@type": "Person",
    "name": "{{ content.blog_author.display_name|default(content.blog_author.full_name)|escape }}"
  },
  "publisher": {
    "@type": "Organization",
    "name": "{{ site_settings.company_name|default('Company Name') }}"
    {% if site_settings.company_logo_url %}
    ,"logo": {
      "@type": "ImageObject",
      "url": "{{ site_settings.company_logo_url }}"
    }
    {% endif %}
  },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "{{ content.absolute_url }}"
  }
}
</script>
```

**Note:** Verify HubL properties (`content.publish_date`, `content.updated`, `content.blog_author`, `content.featured_image`) are available in the blog post context. Use `|datetimeformat` for ISO 8601 format. Wrap in `{% if content.name %}` null check.

### 5. Add `FAQPage` schema to accordion module — **Medium**

**Current state:** No FAQ structured data.

**Fix (add to `modules/page/accordion.module/module.html`, conditionally):**

Add a boolean field `enable_faq_schema` to the accordion's fields.json, then:

```html
{% if module.enable_faq_schema and module.items and module.items|length > 0 %}
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {% for item in module.items %}
    {
      "@type": "Question",
      "name": "{{ item.heading|escape }}",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "{{ item.content|striptags|escape }}"
      }
    }{% if not loop.last %},{% endif %}
    {% endfor %}
  ]
}
</script>
{% endif %}
```

**Important:** Only enable when the accordion genuinely contains FAQ content — not all accordions are FAQs. The toggle field lets editors control this per instance.

### 6. Add `ItemList` schema to blog listing — **Low**

**Fix (add to `templates/blog_listing.html`):**
```html
{% if contents and contents|length > 0 %}
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "itemListElement": [
    {% for post in contents %}
    {
      "@type": "ListItem",
      "position": {{ loop.index }},
      "url": "{{ post.absolute_url }}"
    }{% if not loop.last %},{% endif %}
    {% endfor %}
  ]
}
</script>
{% endif %}
```

---

## Semantic HTML Improvements

### 7. Ensure proper heading hierarchy across modules — **Medium**

**Current state:** `text_helpers.render_heading()` allows configurable heading levels, which is good. But no structural enforcement prevents duplicate h1s.

**Fix:** Add help text to the heading level field in modules warning editors:
```json
{
  "name": "heading_tag",
  "inline_help_text": "Each page should have exactly one H1. Use H2 for section headings, H3 for sub-sections."
}
```

### 8. Use semantic `<article>` elements for repeated content items — **Low**

Where modules render a list of content cards (features, testimonials, team members), each item could be wrapped in `<article>` if it represents standalone content:

```html
{% for item in module.items %}
<article class="m-featureCards__item">
  <!-- item content -->
</article>
{% endfor %}
```

**Apply to:** `features.module`, `card_grid.module`, `team_grid.module`, `testimonial.module`

---

## Technical SEO

### 9. Add structured breadcrumb `<nav>` with `aria-label` — **Medium**

**Current state:** Check if the breadcrumbs module uses `<nav aria-label="Breadcrumb">` wrapper.

**Fix:**
```html
<nav aria-label="Breadcrumb" class="m-breadcrumbs">
  <ol class="m-breadcrumbs__list">
    {% for crumb in breadcrumbs %}
    <li class="m-breadcrumbs__item">
      {% if not loop.last %}
      <a href="{{ crumb.url }}">{{ crumb.label }}</a>
      {% else %}
      <span aria-current="page">{{ crumb.label }}</span>
      {% endif %}
    </li>
    {% endfor %}
  </ol>
</nav>
```

Key: `aria-current="page"` on the current/last breadcrumb item, `<ol>` for ordered list semantics.

### 10. Verify image alt text quality — **Medium**

**Current state:** All image fields have `alt` in their defaults but many use placeholder text like `"Placeholder image description"`.

**Fix:** This is primarily an editor concern, but we can improve defaults and help text:

```json
{
  "name": "image_field",
  "type": "image",
  "inline_help_text": "Add descriptive alt text for accessibility and SEO. Describe what the image shows, not what it is ('Team members collaborating in an office', not 'Image 1'). Leave empty only for purely decorative images."
}
```

---

## Date & Time Markup

### 11. Add `<time datetime="">` to all date-rendering locations — **Medium**

**Current state:** Dates are rendered as plain text throughout the codebase. Without `<time>` elements, search engines cannot reliably parse dates for rich results.

**Locations to fix:**

**Blog post template (`templates/blog_post.html`):**
```html
<time datetime="{{ content.publish_date|datetimeformat('%Y-%m-%dT%H:%M:%S') }}">
  {{ content.publish_date|datetimeformat('%B %d, %Y') }}
</time>
```

**Blog listing template (`templates/blog_listing.html`):**
```html
{% for post in contents %}
<time datetime="{{ post.publish_date|datetimeformat('%Y-%m-%dT%H:%M:%S') }}">
  {{ post.publish_date|datetimeformat('%B %d, %Y') }}
</time>
{% endfor %}
```

**Blog author page and any module rendering dates:**
```html
<time datetime="{{ date_value|datetimeformat('%Y-%m-%d') }}">
  {{ date_value|datetimeformat('%B %d, %Y') }}
</time>
```

**Impact:** Enables Google to display dates in SERPs, improves freshness signals for blog content.

---

## Link & Navigation SEO

### 12. Add `rel="noreferrer"` to external links — **Medium**

**Current state:** External links with `target="_blank"` use `rel="noopener"` but omit `noreferrer`. While `noopener` prevents `window.opener` access, `noreferrer` prevents referrer header leakage to third-party sites.

**Fix:** Add `noreferrer` alongside `noopener` on all external `target="_blank"` links:
```html
<a href="{{ url }}" target="_blank" rel="noopener noreferrer">
```

**Note:** This is both a security and privacy improvement. HubSpot-generated CTAs handle this automatically, but custom links in module templates do not.

### 13. Add pagination `rel="next"` / `rel="prev"` links — **Medium**

**Current state:** Blog listing and search results have pagination UI but no `<link>` elements signalling the relationship between paginated pages to search engines.

**Fix (add to blog listing template, inside `{% block head %}` or via `{% require_head %}`):**
```html
{% if contents.has_previous %}
<link rel="prev" href="{{ blog_page_link(group.absolute_url, current_page_num - 1) }}">
{% endif %}
{% if contents.has_next %}
<link rel="next" href="{{ blog_page_link(group.absolute_url, current_page_num + 1) }}">
{% endif %}
```

**Note:** While Google has stated they don't use `rel="next/prev"` as a ranking signal, other search engines (Bing, Yandex) still do, and it's a best practice for crawl efficiency.

---

## Rich Content Enhancements

### 14. Use `<figure>` and `<figcaption>` for images with captions — **Low**

**Current state:** No modules use `<figure>` + `<figcaption>` semantics. Images with descriptions/captions are rendered as separate `<img>` and `<p>` elements without semantic association.

**Fix pattern:**
```html
{% if item.image.src %}
<figure class="m-moduleName__figure">
  <img src="{{ item.image.src }}"
       alt="{{ item.image.alt }}"
       width="{{ item.image.width }}"
       height="{{ item.image.height }}"
       loading="lazy" decoding="async">
  {% if item.caption %}
  <figcaption class="m-moduleName__caption">{{ item.caption }}</figcaption>
  {% endif %}
</figure>
{% endif %}
```

**Apply to modules with image + text pairings:**
- `gallery.module` (image + optional description)
- `thumbnail_gallery.module` (image + title)
- `team_grid.module` (photo + name/role)
- `text_and_media.module` (if caption field exists)

**Impact:** Helps Google Image Search understand image context. Associates captions with images for screen readers.

### 15. Add estimated reading time to blog posts — **Low**

**Current state:** No reading time displayed on blog posts.

**Fix (add to `templates/blog_post.html`):**
```html
{% set word_count = content.post_body|striptags|wordcount %}
{% set reading_time = (word_count / 200)|round(0, 'ceil')|int %}
<p class="m-blogPost__readingTime">
  <time datetime="PT{{ reading_time }}M">{{ reading_time }} min read</time>
</p>
```

**Impact:** Improves user engagement signals. Can appear in Google Discover. The `<time>` element with ISO 8601 duration format (`PT5M`) provides machine-readable data.

---

## Error Pages

### 16. Ensure 404 and 500 error pages have `noindex` — **Medium**

**Current state:** Error page templates may not explicitly set `noindex`. If `{{ standard_header_includes }}` doesn't handle error pages, they could be indexed.

**Fix (add to error page templates):**
```html
{% block head %}
<meta name="robots" content="noindex, nofollow">
{% endblock %}
```

**Check:** Verify whether HubSpot's `{{ standard_header_includes }}` already adds `noindex` to system error pages. If it does, this is unnecessary. Test by viewing the page source of the 404 page in HubSpot preview.

**Templates to check:**
- `templates/404.html`
- `templates/500.html` (if exists)

---

## Priority by SEO Impact

| Priority | Fix | Impact |
|---|---|---|
| High | `Organization` schema in base.html | Rich results, Knowledge Panel |
| High | `BreadcrumbList` schema | Breadcrumb rich results in SERPs |
| High | `BlogPosting` schema on blog posts | Article rich results, date/author in SERPs |
| Medium | `WebSite` schema with SearchAction | Sitelinks search box in SERPs |
| Medium | `FAQPage` schema on accordion (conditional) | FAQ rich results |
| Medium | Heading hierarchy help text | Content structure signals |
| Medium | Breadcrumb semantic markup | Crawl/index signals |
| Medium | Image alt text guidance | Image search, accessibility signals |
| Medium | `<time datetime="">` on all dates | Date rich results, freshness signals |
| Medium | `rel="noreferrer"` on external links | Security, privacy |
| Medium | Pagination `rel="next/prev"` | Crawl efficiency, Bing/Yandex signals |
| Medium | Error pages `noindex` | Prevent index bloat |
| Low | `ItemList` schema on blog listing | Collection page rich results |
| Low | `<article>` elements for content items | Semantic richness |
| Low | `<figure>` + `<figcaption>` for images | Image search context |
| Low | Blog reading time | User engagement, Google Discover |

---

## HubSpot-Managed SEO (DO NOT DUPLICATE)

These are handled by `{{ standard_header_includes }}` — do not author them in templates:

- `<link rel="canonical">` — managed by HubSpot page settings
- `<meta name="robots">` — managed by HubSpot page settings
- `<meta property="og:*">` — managed by HubSpot page/portal settings
- `<meta name="twitter:*">` — managed by HubSpot page/portal settings
- `<meta name="description">` — already authored in base.html via `{{ page_meta.meta_description }}`
- `<title>` — already authored in base.html via `{{ page_meta.html_title }}`
