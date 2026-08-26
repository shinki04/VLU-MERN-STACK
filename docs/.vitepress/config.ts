import { defineConfig } from 'vitepress'
// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Mern Stack",
  description: "Mern Stack Shopping Online",
  locales: {
    en: {
      label: 'English',
      lang: 'en',
      link: '/en/',
      themeConfig: {
        nav: [
          { text: 'Home', link: '/en/' },
          { text: 'Labs', link: '/en/labs/lab1' },
          { text: 'Advanced', link: '/en/advanced/docker' },
          { text: 'Troubleshooting', link: '/en/troubleshooting/hotmail' },
        ],
        sidebar: [
          {
            text: 'Labs',
            items: [
              { text: 'Lab 01', link: '/en/labs/lab1' },
              { text: 'Lab 02', link: '/en/labs/lab2' },
              { text: 'Lab 03', link: '/en/labs/lab3' },
              { text: 'Lab 04', link: '/en/labs/lab4' },
              { text: 'Lab 05', link: '/en/labs/lab5' },
              { text: 'Lab 06', link: '/en/labs/lab6' },
              { text: 'Lab 07', link: '/en/labs/lab7' },
              { text: 'Lab 08', link: '/en/labs/lab8' },
              { text: 'Lab 09', link: '/en/labs/lab9' }
            ]
          },
          {
            text: 'Advanced',
            items: [
              { text: 'Docker', link: '/en/advanced/docker' }
            ]
          },
          {
            text: 'Troubleshooting',
            items: [
              { text: 'Hotmail Error', link: '/en/troubleshooting/hotmail' },
              { text: 'MongoDB DNS Error', link: '/en/troubleshooting/mongodb-dns' },
              { text: 'MongoDB Auth Error', link: '/en/troubleshooting/mongodb-auth' },
              { text: 'Lab 4 PUT Product Error', link: '/en/troubleshooting/lab4-put-product' },
              { text: 'Auth Token Error', link: '/en/troubleshooting/token-error' },
              { text: 'Docker Virtualization Error', link: '/en/troubleshooting/docker-virtualization' }
            ]
          },
        ]
      }
    },
    vi: {
      label: 'Tiếng Việt',
      lang: 'vi',
      link: '/vi/',
      themeConfig: {
        nav: [
          { text: 'Trang chủ', link: '/vi/' },
          { text: 'Bài thực hành', link: '/vi/labs/lab1' },
          { text: 'Nâng cao', link: '/vi/advanced/docker' },
          { text: 'Khắc phục sự cố', link: '/vi/troubleshooting/hotmail' },

        ],
        sidebar: [
          {
            text: 'Bài thực hành',
            items: [
              { text: 'Lab 01', link: '/vi/labs/lab1' },
              { text: 'Lab 02', link: '/vi/labs/lab2' },
              { text: 'Lab 03', link: '/vi/labs/lab3' },
              { text: 'Lab 04', link: '/vi/labs/lab4' },
              { text: 'Lab 05', link: '/vi/labs/lab5' },
              { text: 'Lab 06', link: '/vi/labs/lab6' },
              { text: 'Lab 07', link: '/vi/labs/lab7' },
              { text: 'Lab 08', link: '/vi/labs/lab8' },
              { text: 'Lab 09', link: '/vi/labs/lab9' }
            ]
          },
          {
            text: 'Nâng cao',
            items: [
              { text: 'Docker', link: '/vi/advanced/docker' }
            ]
          },
          {
            text: 'Khắc phục sự cố',
            items: [
              { text: 'Lỗi Hotmail', link: '/vi/troubleshooting/hotmail' },
              { text: 'Lỗi MongoDB DNS', link: '/vi/troubleshooting/mongodb-dns' },
              { text: 'Lỗi MongoDB Auth', link: '/vi/troubleshooting/mongodb-auth' },
              { text: 'Sửa lỗi Lab 4', link: '/vi/troubleshooting/lab4-put-product' },
              { text: 'Lỗi Auth Token', link: '/vi/troubleshooting/token-error' },
              { text: 'Lỗi Docker Virtualization', link: '/vi/troubleshooting/docker-virtualization' }
            ]
          }
        ]
      }
    }
  },
  
  themeConfig: {
    logo: {
      src: '/images/mern-logo-light.png',
      dark: '/images/mern-logo-dark.png',
      alt: 'MERN Stack Logo'
    },
    i18nRouting: true,
    socialLinks: [
      { icon: 'github', link: 'https://github.com/shinki04/VLU-MERN-STACK' }
    ],
    outline:{
      level: [1,8]
    },
    search: {
      provider: 'local'
    }
  },
    markdown: {
    image: {
      // image lazy loading is disabled by default
      lazyLoad: true
      },
      config(md) {
        const defaultRender = md.renderer.rules.link_open

        md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
          const token = tokens[idx]

          token.attrSet('target', '_blank')
          token.attrSet('rel', 'noopener noreferrer')

          return defaultRender
            ? defaultRender(tokens, idx, options, env, self)
            : self.renderToken(tokens, idx, options)
        }
      },
  },

})
