import MarketingContentPage from './MarketingContentPage'
import homeHtml from './content/home.html?raw'
import aboutHtml from './content/about.html?raw'
import productsHtml from './content/products.html?raw'
import partnerHtml from './content/partner.html?raw'
import contactHtml from './content/contact.html?raw'
import privacyHtml from './content/privacy.html?raw'
import termsHtml from './content/terms.html?raw'

export function MarketingHomePage() {
  return <MarketingContentPage html={homeHtml} />
}

export function MarketingAboutPage() {
  return <MarketingContentPage html={aboutHtml} />
}

export function MarketingProductsPage() {
  return <MarketingContentPage html={productsHtml} />
}

export function MarketingPartnerPage() {
  return <MarketingContentPage html={partnerHtml} />
}

export function MarketingContactPage() {
  return <MarketingContentPage html={contactHtml} />
}

export function MarketingPrivacyPage() {
  return <MarketingContentPage html={privacyHtml} />
}

export function MarketingTermsPage() {
  return <MarketingContentPage html={termsHtml} />
}
