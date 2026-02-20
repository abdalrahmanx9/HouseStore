import { useEffect } from 'react'

interface PageMeta {
  title?: string
  description?: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
}

function setMetaTag(name: string, content: string, attr: 'name' | 'property' = 'name') {
  let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

export function usePageMeta({ title, description, ogTitle, ogDescription, ogImage }: PageMeta) {
  useEffect(() => {
    const prev = document.title
    if (title) document.title = `${title} | House Store`
    if (description) setMetaTag('description', description)
    if (ogTitle) setMetaTag('og:title', ogTitle, 'property')
    if (ogDescription) setMetaTag('og:description', ogDescription, 'property')
    if (ogImage) setMetaTag('og:image', ogImage, 'property')

    return () => {
      document.title = prev
    }
  }, [title, description, ogTitle, ogDescription, ogImage])
}
