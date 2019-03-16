const axios = require('axios')
const fs = require('fs-extra')
const HTMLPolicyLoader = require('./html-policy-loader')
const PDFPolicyLoader = require('./pdf-policy-loader')

module.exports = class PolicyLoader {
  constructor (name, url) {
    this.name = name
    this.url = url.trim()

    if (!this.url.startsWith('http')) {
      this.url = `http://${this.url}`
    }
  }

  async process () {
    console.log(`Processing`, this.name, this.url)

    const outputPath = `./out/${this.name}`

    try {
      const response = await axios.get(this.url, { responseType: 'arraybuffer' })

      if (response.headers['content-type'] === 'application/pdf') {
        await PDFPolicyLoader.process(response.data, outputPath)
      } else {
        await HTMLPolicyLoader.process(this.url, outputPath)
      }
    } catch (reqErr) {
      let errorOutput
      if (!reqErr.response) {
        errorOutput = `Unknown error: ${reqErr.code}`
      } else {
        errorOutput = `HTTP error: ${reqErr.response.statusText}`
      }

      console.log(errorOutput)
      fs.outputFileSync(`${outputPath}.error.txt`, errorOutput)
    }
  }
}
