var express = require('express');
var router = express.Router();
const StarWebPrintBuilder = require('../lib/star-web-print/StarWebPrintBuilder')
const StarWebPrintTrader = require('../lib/star-web-print/StarWebPrintTrader')

const sendMessage = (message) => {
  const trader = new StarWebPrintTrader({
    url: 'http://localhost:5000/StarWebPRNT/SendMessage',
    papertype: 'normal',
  });

  console.log('message', message)
  console.log('Is trader online', !trader.isOffline)
  console.log('sending message to trader', trader)

  trader.sendMessage({ request: message })
}

const onSendAscii = () => {
  var builder = new StarWebPrintBuilder();
  var request = '';
  request += builder.createInitializationElement();
  request += builder.createTextElement({characterspace:0});
  request += builder.createAlignmentElement({position:'right'});
  request += builder.createLogoElement({number:1});
  request += builder.createTextElement({data:'TEL 9999-99-9999\n'});
  request += builder.createAlignmentElement({position:'left'});
  request += builder.createTextElement({data:'\n'});
  request += builder.createAlignmentElement({position:'center'});
  request += builder.createTextElement({data:'Thank you for your coming. \n'});
  request += builder.createTextElement({data:"We hope you'll visit again.\n"});
  request += builder.createAlignmentElement({position:'left'});
  request += builder.createTextElement({data:'\n'});
  request += builder.createTextElement({data:'Apple                                     $20.00\n'});
  request += builder.createTextElement({data:'Banana                                    $30.00\n'});
  request += builder.createTextElement({data:'Grape                                     $40.00\n'});
  request += builder.createTextElement({data:'Lemon                                     $50.00\n'});
  request += builder.createTextElement({data:'Orange                                    $60.00\n'});
  request += builder.createTextElement({emphasis:true, data:'Subtotal                                 $200.00\n'});
  request += builder.createTextElement({data:'\n'});
  request += builder.createTextElement({underline:true, data:'Tax                                       $10.00\n'});
  request += builder.createTextElement({underline:false});
  request += builder.createTextElement({emphasis:true});
  request += builder.createTextElement({width:2, data:'Total            $210.00\n'});
  request += builder.createTextElement({width:1});
  request += builder.createTextElement({emphasis:false});
  request += builder.createTextElement({data:'\n'});
  request += builder.createTextElement({data:'Received                                 $300.00\n'});
  request += builder.createTextElement({width:2, data:'Change            $90.00\n'});
  request += builder.createTextElement({width:1});
  request += builder.createTextElement({data:'\n'});
  request += builder.createTextElement({characterspace:0});
  request += builder.createCutPaperElement({feed:true});

  sendMessage(request);
}

const print = (xml) => {
  const request = require("request");

  request.post({
      url: "http://192.168.2.2/StarWebPRNT/SendMessage",
      port: 80,
      method:"POST",
      headers:{
        'Content-Type': 'application/xml',
      },
      body: xml,
    },
    function(error, response, body) {
      console.log('Post success', {
        error,
        response,
        body,
      });
    });
}

/* GET home page. */
router.get('/', function(req, res) {
  console.log('StarWebPrint APIs', { StarWebPrintTrader, StarWebPrintBuilder })

  res.render('index', {
    title: 'Express',
  });
});

router.get('/test', (req, res, next) => {
  onSendAscii()
  res.render('test')
})

const xml = '<initialization/><text characterspace="2"/><alignment position="right"/><logo number="1"/><text>TEL\x209999-99-9999\x0a</text><alignment position="left"/><text>\x0a</text><alignment position="center"/><text>Thank\x20you\x20for\x20your\x20coming.\x20\x0a</text><text>We\x20hope\x20you\'ll\x20visit\x20again.\x0a</text><alignment position="left"/><text>\x0a</text><text>Apple\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20$20.00\x0a</text><text>Banana\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20$30.00\x0a</text><text>Grape\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20$40.00\x0a</text><text>Lemon\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20$50.00\x0a</text><text>Orange\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20$60.00\x0a</text><text emphasis="true">Subtotal\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20$200.00\x0a</text><text>\x0a</text><text underline="true">Tax\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20$10.00\x0a</text><text underline="false"/><text emphasis="true"/><text width="2">Total</text><text width="1">\x20\x20\x20</text><text width="2">$210.00\x0a</text><text width="1"/><text emphasis="false"/><text>\x0a</text><text>Received\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20$300.00\x0a</text><text width="2">Change</text><text width="1">\x20\x20\x20</text><text width="2">$90.00\x0a</text><text width="1"/><text>\x0a</text><text characterspace="0"/><cutpaper feed="true"/>\n'

router.post('/print', (req, res, next) => {
  console.log('Hi you have posted to the print route')
  console.log('We are automatically going to print something right now.')
  return print(xml);
});

/**
 * Tells the printer that there is a job in the server for printing
 */
router.post('/poll', (req, res) => {
  console.log('POST to poll')
  res.status(200)
  res.setHeader('Content-Type', 'application/json')
  return res.json({ jobReady: true, mediaTypes: ['text/plain', 'image/png'], deleteMethod: 'DELETE' })
})

// [http/https]://[cloudprntURL]?uid=<printer ID>&type=<media type>&mac=<mac address>
router.get('/poll', (req, res, next) => {
  console.log('GET at poll -> req.query', req.query)
  const printContent = 'print me'
  const { uid, type, mac } = req.query
  res.setHeader('Content-Type', 'text/plain')
  res.status(200)
  return res.send(printContent)
})

module.exports = router;
