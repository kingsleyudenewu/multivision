var express = require('express');
var stylus  = require('stylus');
var logger = require('morgan');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';
var app = express();

function compile(str, path){
    return stylus(str).set('filename', path);
}

app.set('views', __dirname + '/server/views');
app.set('view engine', 'jade');
//create express logging function
app.use(logger('dev'));
//This enables passing url encoded body
app.use(bodyParser.urlencoded({extended : true}));
//This enable json encoded body
app.use(bodyParser.json());
app.use(stylus.middleware(
    {
        src:__dirname + '/public',
        compile : compile
    }
));

app.use(express.static(__dirname + '/public'));

//Connect to mondb database
mongoose.connect('mongodb://localhost/multivision');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection error...'));
db.once('open', function callback(){
    console.log('multivision db opened');
});

//WE create our schema
var messageSchema = mongoose.Schema({message : String});
var Message = mongoose.model('Message', messageSchema);
var mongoMessage;
Message.findOne().exec(function(err, messageDoc){
    mongoMessage = messageDoc.message;
});

//Create a route for your partials
app.get('/partials/:partialPath', function(req, res){
    res.render('partials/' + req.params.partialPath);
});

//We use the * to match all route because any route that passes through this channel the * will handle it. This include css, img, javascript request

app.get('*', function(req, res){
    res.render('index', {
        mongoMessage : mongoMessage
    });
});

var port = process.env.PORT || 3000
app.listen(port);
console.log('Running at port 3000');