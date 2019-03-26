const fs = require('fs-extra')
const puppeteer = require('puppeteer')
const Mercury = require('@postlight/mercury-parser')

module.exports = class HTMLPolicyLoader {
  static async start () {
    this.browser = await puppeteer.launch()
  }

  static async stop () {
    await this.browser.close()
  }

  static async process (url, path) {
    try {
      const page = await this.browser.newPage()
      await page.goto(url, { waitUntil: 'networkidle2' })

      // Scroll down google docs pages
      let pages = await page.$$(`.kix-page`)
      for (const page of pages) {
        await page.hover()
      }

      // Get HTML after running javascript
      const renderedHTML = await page.evaluate(async () => {
        window.scrollTo(0, document.body.scrollHeight)

        return {
          text: document.body.innerText,
          bodyHTML: document.body.innerHTML
        }
      })

      // Parse HTML into markdown
      let markdown = await Mercury.parse(url, {
        html: renderedHTML.bodyHTML,
        contentType: 'markdown'
      })

      fs.outputFileSync(`${path}.md`, markdown.content)
      fs.outputFileSync(`${path}.txt`, renderedHTML.text)

      // Save as a PDF
      await page.pdf({ path: `${path}.pdf` })
    } catch (err) {
      console.log('HTMLPolicyLoader Error', err)
    }
  }
}
