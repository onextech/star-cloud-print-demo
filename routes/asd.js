const express = require('express')
const router = express.Router()

const Queue = require('../utils/Queue')

const printJobs = new Queue()

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
  const orderDetailsFormatted = Object.values(orderDetails).map((orderItems) => {
    const { quantity, title, subtitle } = orderItems
    const orderItemFormatted = `  ${quantity} x ${title}\n`
    if (subtitle) {
      const orderItemSubtitleFormatted = `    - ${subtitle}\n`
      return orderItemFormatted + orderItemSubtitleFormatted
    }
    return orderItemFormatted
  })
  const printContent =
    '                 AH SENG DURIAN                 \n' +
    '------------------------------------------------\n' +
    '              Your Queue Number is              \n' +
    `                      ${queueNo}\n` +
    '------------------------------------------------\n' +
    orderDetailsFormatted.join('') +
    '------------------------------------------------\n' +
    '  Please present this ticket at the collection  \n' +
    '  counter when your queue number is called.     \n' +
    '                                                \n' +
    '  To check on the queue status, log onto        \n' +
    '  https://www.google.com/doodles                \n' +
    '                                                \n' +
    '  Date & Time: 11-09-2018 20:30                 \n'
  printJobs.add(printContent)
  res.status(200)
  return res.send('ok')
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
