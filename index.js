var http = require('http');
var fs=require('fs')
var request = require('request');
var argv=require('yargs').argv

var logStream=argv.logfile ? fs.createWriteStream(argv.logfile) : process.stdout

var localhost='127.0.0.1'
var scheme='http://'
var host=argv.host|| '127.0.0.1'
var port=argv.port|| (host===localhost ?  8000: 80)
var destinaltionUrl=scheme + host + ':' + port

var echoServer = http.createServer(function (req, res) {
    logStream.write('echoServer')
    for (var header in req.headers) {
        res.setHeader(header, req.headers[header])
    }
    logStream.write(JSON.stringify(req.headers)+"\n")
    req.pipe(res)
    // res.end(res.toString())
})
echoServer.listen(8000)
logStream.write('proxyServer listening @ 127.0.0.1:8000 \n')

var proxyServer = http.createServer(function (req, res) {
    logStream.write("proxyserver")
    logStream.write(JSON.stringify(req.headers)+"\n")
    //x-destination-url
    var url= destinaltionUrl
    if (req.headers['x-destination-url']){
        url='http://'+req.headers['x-destination-url']
    }
    var options = {
        url: url + req.url
    }
    req.pipe(request(options)).pipe(res)
    // res.end(res.toString())
})
proxyServer.listen(9000)
logStream.write('proxyServer listening @ 127.0.0.1:9000 \n')