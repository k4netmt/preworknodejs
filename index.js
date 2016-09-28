var http = require('http');
var request = require('request');
var argv=require('yargs').argv

var localhost='127.0.0.1'
var scheme='http://'
var host=argv.host|| '127.0.0.1'
var port=argv.port|| (host===localhost ?  8000: 80)
var destinaltionUrl=scheme + host + ':' + port


var echoServer = http.createServer(function (req, res) {
    console.log(req.headers)
    for (var header in req.headers) {
        res.setHeader(header, req.headers[header])
    }
    req.pipe(res)
    // res.end(res.toString())
})
echoServer.listen(8000)

var proxyServer = http.createServer(function (req, res) {
    console.log("proxyserver")
    var options = {
        url: destinaltionUrl + req.url
    }
    var outboundRequest=request(options)
    req.pipe(outboundRequest).pipe(res)
    // res.end(res.toString())
})
proxyServer.listen(9000)