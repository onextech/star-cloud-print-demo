var express = require('express')
var router = express.Router()
const path = require('path')
const printer = require('node-thermal-printer')

const asd = require('./asd')

router.use('/asd', asd)

let printed = false

router.post('/printAgain', (req, res) => {
  printed = false
  return res.send('ok')
})

/**
 * Tells the printer that there is a job in the server for printing
 */
router.post('/poll', (req, res) => {
  console.log('POST to poll -> req.body', req.body)
  res.status(200)
  res.setHeader('Content-Type', 'application/json')
  const jobReady = !printed
  return res.json({ jobReady, mediaTypes: ['application/vnd.star.line'], deleteMethod: 'DELETE' })
})

// [http/https]://[cloudprntURL]?uid=<printer ID>&type=<media type>&mac=<mac address>
router.get('/poll', (req, res, next) => {
  console.log('GET at poll -> req.query', req.query)
  console.log('hi i am at get /poll')
  res.setHeader('Content-Type', 'application/vnd.star.line')
  printer.init({ type: 'star', interface: '/dev/usb/lp0' })

  printer.println('Default')

  printer.setTextDoubleHeight()
  printer.println('Double Height')
  printer.setTextNormal()

  printer.setTextDoubleWidth()
  printer.println('Double Width')
  printer.setTextNormal()

  printer.setTextQuadArea()
  printer.println('Quad Area')
  printer.setTextNormal()

  printer.underline(true)
  printer.println('Underline')
  printer.underline(false)
/*
  // doesn't work on our Star printer
  printer.underlineThick(true)
  printer.println('Underline Thick')
  printer.underlineThick(false)
*/
  printer.bold(true)
  printer.println('Bold')
  printer.bold(false)

  printer.invert(true)
  printer.println('Invert')
  printer.invert(false)

  printer.upsideDown(true)
  printer.println('Upside Down')

  printer.partialCut()

  printer.leftRight('Left', 'Right')

  printer.table(['Table', 'One', 'Two'])

  printer.tableCustom([
    { text: 'Left', align: 'LEFT', width: 0.5 },
    { text: 'Center', align: 'CENTER', width: 0.25, bold: true },
    { text: 'Right', align: 'RIGHT', width: 0.25 }
  ])
/*
  // not working
  printer.printImage('../logo_playstation.png', function (done) { printer.cut() })

  printer.partialCut()

  // not working
  printer.printQR('www.google.com') // Print QR code
*/
  printer.cut()

  printer.alignLeft()
  printer.println('Align Left')

  printer.alignCenter()
  printer.println('Align Center')

  printer.alignRight()
  printer.println('Align Right')

  printer.setTypeFontA()
  printer.println('Font Type A')

  printer.setTypeFontB()
  printer.println('Font Type B')
/*
  // doesn't work on our Star printer
  printer.drawLine()
*/
  printer.cut()

  const buffer = printer.getBuffer()
  printer.clear()
  res.status(200)
  console.log('========================')
  console.log('Buffer', buffer)
  console.log('========================')
  printed = true
  res.send(buffer)
})

module.exports = router
