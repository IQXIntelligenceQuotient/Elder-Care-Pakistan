import { createElement as h } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

export const origin = 'https://eldercarepakistan.org'
const url = origin + '/care-support.html'
const title = 'Get Elder Care Support | Elder Care Pakistan'
const description = 'Explore home nursing, physiotherapy, medical consultation and referral guidance for older people. Ask Elder Care Pakistan what support is available in your area.'
const services = [
  ['Doctor consultation', 'Doctor-Consultation.html', 'Ask about consultation coordination and appointment guidance.'],
  ['Home nursing', 'Nurse-at-Home.html', 'Ask about nursing availability and care coordination.'],
  ['Home physiotherapy', 'Physiotherapy-at-Home.html', 'Find out how to ask about physiotherapy support.'],
  ['Dialysis referral support', 'Dialysis-at-Home.html', 'Learn about referral guidance and related support.'],
  ['Lab test support', 'Lab-Test.html', 'Ask about support coordinated through qualified providers.'],
  ['Home-based health support', 'Covid-Care.html', 'Read about home-based support and referral limits.'],
]
const faqs = [
  ['How do I ask for support?', 'Contact Elder Care Pakistan with your city and the type of help you are seeking. Ask what support or referral guidance is currently available.'],
  ['Is support available in my area?', 'Availability depends on location, programme capacity, and care needs. The organisation can confirm what is available for your situation.'],
  ['Can I use this page for an emergency?', 'For urgent medical care, contact your local emergency service or a qualified healthcare provider.'],
]
const schema = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'WebPage', '@id': url + '#webpage', url, name: title, description, publisher: { '@id': origin + '/#organization' } },
    { '@type': 'NGO', '@id': origin + '/#organization', name: 'Elder Care Pakistan', url: origin + '/' },
    { '@type': 'FAQPage', '@id': url + '#faq', mainEntity: faqs.map(([name, text]) => ({ '@type': 'Question', name, acceptedAnswer: { '@type': 'Answer', text } })) },
    { '@type': 'BreadcrumbList', '@id': url + '#breadcrumb', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: origin + '/' },
      { '@type': 'ListItem', position: 2, name: 'Get care support', item: url },
    ] },
  ],
}

export function renderCarePage() {
  const link = (href, label) => h('a', { href }, label)
  return '<!doctype html>' + renderToStaticMarkup(h('html', { lang: 'en' },
    h('head', null,
      h('meta', { charSet: 'utf-8' }),
      h('meta', { name: 'viewport', content: 'width=device-width, initial-scale=1' }),
      h('title', null, title),
      h('meta', { name: 'description', content: description }),
      h('link', { rel: 'canonical', href: url }),
      h('link', { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' }),
      h('link', { rel: 'manifest', href: '/site.webmanifest' }),
      h('link', { rel: 'stylesheet', href: '/assets/css/care-support.css' }),
      h('link', { rel: 'stylesheet', href: '/assets/css/site-refinements.css' }),
      h('script', { defer: true, src: '/assets/js/site-refinements.js' }),
      ...Object.entries({ type: 'website', title, description, url, image: origin + '/assets/img/about/elder-care-pakistan-social.jpg' }).map(([name, content]) => h('meta', { property: 'og:' + name, content })),
      h('meta', { name: 'twitter:card', content: 'summary_large_image' }),
      h('script', { type: 'application/ld+json', dangerouslySetInnerHTML: { __html: JSON.stringify(schema).replaceAll('<', '\\u003c') } }),
    ),
    h('body', null,
      h('a', { className: 'skip-link', href: '#main-content' }, 'Skip to main content'),
      h('header', { className: 'care-shell' }, h('nav', { 'aria-label': 'Main navigation' },
        link('/', 'Elder Care Pakistan'),
        h('button', { type: 'button', className: 'ecp-care-menu-trigger', 'aria-controls': 'care-main-menu', 'aria-expanded': false }, 'Menu'),
        h('div', { id: 'care-main-menu', className: 'ecp-care-menu' },
          link('/About-Us.html', 'About'), link('/master-donation-hub.html', 'Ways to donate'), link('/Contact-Us.html', 'Contact')))),
      h('main', { id: 'main-content', tabIndex: -1 },
        h('div', { className: 'care-shell' },
          h('nav', { 'aria-label': 'Breadcrumb', className: 'breadcrumbs' }, link('/', 'Home'), h('span', { 'aria-current': 'page' }, 'Get care support')),
          h('section', { className: 'care-hero' },
            h('div', null, h('h1', null, 'Get elder care support'), h('p', null, 'Tell us your city and what help you need. We can explain what support is available.'),
              h('a', { href: '/Contact-Us.html', className: 'care-button' }, 'Ask about care support')),
            h('img', { src: '/assets/img/about/about-three-right.jpg', alt: 'Care and companionship for an older person', width: 652, height: 587 }),
          ),
          h('section', null, h('h2', null, 'Care and referral options'), h('ul', { className: 'care-grid' },
            ...services.map(([name, href, text]) => h('li', { key: href }, h('h3', null, link('/' + href, name)), h('p', null, text))))),
        ),
        h('section', { id: 'faq', className: 'ecp-faq-section', 'aria-labelledby': 'faq-title' },
          h('div', { className: 'care-shell' },
            h('header', { className: 'ecp-faq-heading' },
              h('span', null, 'Care FAQ'),
              h('h2', { id: 'faq-title' }, 'Frequently asked questions'),
              h('p', null, 'Find answers about care support and how to ask for guidance.')),
            h('div', { className: 'ecp-faq-layout' },
              h('div', { className: 'ecp-faq-accordion' },
                ...faqs.map(([question, answer], index) => h('details', { key: question, open: index === 0 },
                  h('summary', null, question), h('div', { className: 'ecp-faq-answer' }, h('p', null, answer))))),
              h('aside', { className: 'ecp-faq-help', 'aria-labelledby': 'faq-help-title' },
                h('img', { src: '/assets/img/logos/chat-outline.svg', alt: '', width: 48, height: 48 }),
                h('h3', { id: 'faq-help-title' }, 'Need help finding care?'),
                h('p', null, 'Tell our team what kind of support you’re looking for.'),
                link('/Contact-Us.html#ecpContactForm', 'Ask about care'),
                h('a', { href: 'https://wa.me/923214277856', target: '_blank', rel: 'noopener' }, 'Ask on WhatsApp'))))),
      ),
      h('footer', { className: 'care-shell' }, h('nav', { 'aria-label': 'Footer navigation' },
        link('/', 'Home'), link('/About-Us.html', 'About'), link('/Contact-Us.html', 'Contact'), link('/master-donation-hub.html', 'Ways to donate'))),
      h('a', { className: 'ecp-whatsapp-float', href: 'https://wa.me/923214277856', 'aria-label': 'Chat with Elder Care Pakistan on WhatsApp', target: '_blank', rel: 'noopener' },
        h('img', { src: '/assets/img/logos/whatsapp.svg', alt: '', width: 28, height: 28 })),
    ),
  ))
}
