const fs = require('fs-extra')
const puppeteer = require('puppeteer')

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

      // Save as plain text
      const innerText = await page.evaluate(() => {
        // GABE: hack for first round's js visiblity stuff
        if (document.getElementById('1164')) {
          document.getElementById('1164').style.visibility = 'visible'
        }

        return document.body.innerText
      })

      fs.outputFileSync(`${path}.txt`, innerText)

      // Save as a PDF
      await page.pdf({ path: `${path}.pdf` })
    } catch (err) {
      console.log('HTMLPolicyLoader Error', err)
    }
  }
}
