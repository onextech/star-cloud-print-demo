var express = require('express')
var router = express.Router()

const path = require('path')

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
  return res.json({ jobReady, mediaTypes: ['image/jpeg'], deleteMethod: 'DELETE' })
})

// [http/https]://[cloudprntURL]?uid=<printer ID>&type=<media type>&mac=<mac address>
// Prints a mountain image
router.get('/poll', (req, res, next) => {
  console.log('GET at poll -> req.query', req.query)
  console.log('hi i am at get /poll')
  const file = path.join(__dirname, '../mountains.jpeg');
  res.setHeader('Content-Type', 'image/jpeg')
  res.status(200)
  printed = true
  res.sendFile(file)
})

module.exports = router;
