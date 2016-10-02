var http = require('http');
var fs=require('fs')
var request = require('request');
var argv=require('yargs')
    .usage('Usage: node ./$0 [options]')
    .option( "p", { alias: "port", demand: false, describe: "Specify a forwarding port", type: "string" } )
    .option( "x", { alias: "host", demand: false, describe: "Specify a forwarding host", type: "string" } )
    .option( "e", { alias: "exec", demand: false, describe: "Specify a process to proxy instead", type: "string" } )
    .option( "l", { alias: "logfile", demand: false, describe: "Specify a output log file", type: "string" } )
    .help( "h" )
    .alias( "h", "help" )
    .argv

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

    //x-destination-url
    var url= destinaltionUrl
    if (req.headers['x-destination-url']){
        url='http://'+req.headers['x-destination-url']
    }
    var options = {
        url: url + req.url
    }
    var outboundRes=req.pipe(request(options))
    logStream.write(JSON.stringify(outboundRes.headers)+"\n")
    outboundRes.pipe(res)
    outboundRes.pipe(logStream)
    // res.end(res.toString())
})
proxyServer.listen(9000)
logStream.write('proxyServer listening @ 127.0.0.1:9000 \n')