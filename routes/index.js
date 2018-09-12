var express = require('express')
var router = express.Router()
const path = require('path')
const printer = require('node-thermal-printer')

const asd = require('./asd')

router.use('/asd', asd)

let printed = false

/**
 * Tells the printer that there is a job in the server for printing
 */
router.post('/poll', (req, res) => {
  console.log('POST to poll -> req.body', req.body)
  res.status(200)
  res.setHeader('Content-Type', 'application/json')
  const jobReady = !printed
  // const jobReady = true
  return res.json({ jobReady, mediaTypes: ['application/vnd.star.line'], deleteMethod: 'DELETE' })
})

// [http/https]://[cloudprntURL]?uid=<printer ID>&type=<media type>&mac=<mac address>
router.get('/poll', (req, res, next) => {
  console.log('GET at poll -> req.query', req.query)
  console.log('hi i am at get /poll')
  res.setHeader('Content-Type', 'application/vnd.star.line')
  printer.init({ type: 'star', interface: '/dev/usb/lp0' });
  printer.alignCenter();
  printer.bold(true);
  printer.setTextDoubleHeight();
  printer.println('Hello world');
  const buffer = printer.getBuffer();
  res.status(200)
  console.log('========================')
  console.log('Buffer', buffer);
  console.log('========================')
  printed = true
  res.send(buffer)
})

module.exports = router;
