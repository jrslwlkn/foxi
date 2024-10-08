#### Quickly translate selected or typed text on web pages. Supports Google Translate and DeepL API.

## Prerequisites and Installation

First, install the AnciConnect plugin:

1. Open the Install Add-on dialog by selecting Tools > Add-ons > Browse & Install in Anki.
2. Input `2055492159` into the text box labeled Code and press the OK button to proceed.
3. Restart Anki when prompted to do so in order to complete the installation of AnkiConnect.

Start local dev server:

> Required Node v14-v18 (using v18 currently)

1. Clone the repository `git clone https://github.com/jrslwlkn/foxi`
2. Run `npm install`
3. Run `npm run watch-dev`

### Load the extension in Chrome

1. Open Chrome browser and navigate to `chrome://extensions`
2. Select "Developer Mode" and then click "Load unpacked extension..."
3. From the file browser, choose to `foxi/dev/chrome`

### Load the extension in Firefox

1. Open Firefox browser and navigate to `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on" and from the file browser, choose `foxi/dev/firefox`
