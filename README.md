# photoserver
Home server for storing photos and other types of documents

## Continuous Development
I decided to follow some rules for enabling the power of continuous development principles as described in Continuous Delivery Pipelines by Dave Farley. So here are some steps to set up things to make the CD work

### Version Control
Version control in use is git provided by GitHub.

### UI Testing
For UI testing I chose Puppeteer. To install it I followed [https://developers.google.com/web/tools/puppeteer/get-started](https://developers.google.com/web/tools/puppeteer/get-started).

I am using python virtualenvs and virtualenvwrapper on my computer and there is a possibility to create virtual environment for nodejs and then run nodeenv, a virtual environment for nodejs in that virtualenv. To start working in those virtual environments run

`workon nodejs`

then create a new nodeenv by

`nodeenv puppeteer`

activate it by

`. puppeteer/bin/activate`

then cd to that directory

`cd puppeteer`

install puppeteer following the get-started page

`npm i puppeteer`

finally run some puppeteer test like the 'example.js'

`node example.js`

For this file the require must be set to see the puppeteer package or the file should be copied to ..nodeenv/puppeteer folder and `require('puppeteer');` should work.




