const express = require('express')
const router = express.Router()
const printer = require('node-thermal-printer')
const path = require('path')

const Queue = require('../utils/Queue')

const printJobs = new Queue()
const MAX_QUANTITY_CHARS = 3

/* GET */
router.get('/', function(req, res, next) {
  res.send('this is from asd.js')
})

/*
  POST print receipt
  Receives a request with params to populate the receipt to be printed
*/
router.post('/printReceipt', function(req, res, next) {
  const reqParams = req.body
  const { queueNo, orderDetails } = reqParams

  printer.init({ type: 'star', interface: '/dev/usb/lp0' })
  printer.alignCenter()

  const fileLogo = path.join(__dirname, '../ah_seng_durian_logo.png');
  printer.printImage(fileLogo, function (done) {
    // printer.println('AH SENG DURIAN')
    // printer.println('------------------------------------------------')
    printer.println('Your Queue number is')
    printer.setTextQuadArea()
    printer.bold(true)
    printer.println(queueNo)
    printer.bold(false)
    printer.setTextNormal()
    printer.println('------------------------------------------------')

    printer.alignLeft()
    Object.values(orderDetails).forEach((orderItems) => {
      const { quantity, title, subtitle } = orderItems
      printer.tableCustom([
        { text: quantity.toString().padStart(MAX_QUANTITY_CHARS, ' '), align: 'CENTER', width: 0.1 },
        { text: 'x', align: 'CENTER', width: 0.1 },
        { text: title, align: 'LEFT', width: 0.6, bold: true },
      ])
      if (subtitle) {
        printer.tableCustom([
          { text: String().padStart(MAX_QUANTITY_CHARS, ' '), align: 'CENTER', width: 0.1 },
          { text: '-', align: 'CENTER', width: 0.1 },
          { text: subtitle, align: 'LEFT', width: 0.6 },
        ])
      }
    })
    printer.println('------------------------------------------------')

    printer.println('Please present this ticket at the collection')
    printer.println('counter when your queue number is called.')
    printer.newLine()
    printer.println('To check on the queue status, log onto')
    printer.println('https://www.google.com/doodles')
    printer.newLine()
    printer.println('Date & Time: 11-09-2018 20:30')

    const buffer = printer.getBuffer()
    printJobs.add(buffer)
    printer.clear()

    res.status(200)
    return res.send('ok')
  })
})

/* GET and display print job on console */
router.get('/printJobs', function(req, res, next) {
  res.status(200)
  return res.send(printJobs.first())
})

/**
 * Tells the printer that there is a job in the server for printing
 */
router.post('/poll', (req, res) => {
  console.log('POST to poll')
  res.status(200)
  res.setHeader('Content-Type', 'application/json')
  const jobReady = Boolean(printJobs.size())
  return res.json({ jobReady, mediaTypes: ['text/plain', 'image/png'], deleteMethod: 'DELETE' })
})

// [http/https]://[cloudprntURL]?uid=<printer ID>&type=<media type>&mac=<mac address>
// Sends the print job to the printer
router.get('/poll', (req, res, next) => {
  console.log('GET at poll -> req.query', req.query)
  const printContent = printJobs.first()
  console.log('printContent', printContent)
  const { uid, type, mac } = req.query
  res.setHeader('Content-Type', 'text/plain')
  res.status(200)
  return res.send(printContent)
})

// [http/https]://[cloudprntURL]?uid=<printer ID>&type=<media type>&mac=<mac address>
// Print job is done, delete from print jobs
router.delete('/poll', (req, res, next) => {
  printJobs.remove()
  res.status(200)
  return res.send('ok')
})

module.exports = router
