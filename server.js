const {createServer} = require('http');
const methods = Object.create(null);
const fs = require('fs');
createServer((req,res)=>{
    switch(req.method){
        case 'GET':
            res.writeHead(200,{"Content-Type":"text/html"});
            const data = require('./data.json');
            const template = require('./template.js');
            res.write(template(data));
            res.end();
        break;
        case 'POST':
            res.write("Post request")
            res.end();
            break;
    }
}).listen(8000);
async function notAllowed(req){
    return {
        status:405,
        body:`Method ${req.method} not allowed`
    }
}