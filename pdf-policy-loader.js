const pdfjs = require('pdfjs-dist')
const fs = require('fs-extra')

module.exports = class PDFPolicyLoader {
  static async process (data, path) {
    try {
      const doc = await pdfjs.getDocument({ data })

      // Parse and save plain text
      const numPages = doc.numPages
      let strings = []

      for (let pageNumber = 1; pageNumber <= numPages; pageNumber++) {
        const page = await doc.getPage(pageNumber)
        const textContent = await page.getTextContent()

        textContent.items.forEach((item) => {
          strings.push(item.str)
        })
      }

      fs.outputFileSync(`${path}.txt`, strings.join(''))

      // Save as a PDF
      fs.outputFileSync(`${path}.pdf`, data)
    } catch (err) {
      console.log(`PDFPolicyLoader Error`, err)
    }
  }
}
