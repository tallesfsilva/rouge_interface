'use-strict'
require('dotenv').config()
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose');
const fileUpload = require('express-fileupload');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var apiRouter = require('./routes/api');
const jwt = require('jsonwebtoken');
var app = express();



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'projetos')));

app.use(fileUpload());

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api', apiRouter);

app.disable('x-powered-by');

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});


var mongoDB = 'mongodb+srv://dbadmin:admin123@cluster0.8nnex.azure.mongodb.net/rouge_interface?retryWrites=true&w=majority';
mongoose.connect(mongoDB, { useNewUrlParser: true , useUnifiedTopology: true});
var db = mongoose.connection;
var db2 = mongoose.connection.collections;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));


const fs = require('fs');
const { FORMERR } = require('dns');
const csv = require('csvtojson');
const { json } = require('express');

/*var data ='';
let result =[];

let csv_temp = "";


var readFile = fs.readFile('/home/talles/Documents/v1.2.2/projects/test-summarization/results/results.csv', 'utf8', (err, data) =>{

    if(err) return console.log(err);

    //console.log(data);
    //Regex com replace substitua todos os valores
    csv_temp = data.split("");
    for(i=0;i<csv_temp.length;i++) {
      if((csv_temp[i]=="," && csv_temp[i+1]=="0" && csv_temp[i+2]==",") || 
      (csv_temp[i]=="," && csv_temp[i+1]=="1" && csv_temp[i+2]==",")) {
        csv_temp[i+2]=".";
         }
      }
      csv_temp = csv_temp.join("");


   // csv_temp = data.replace(/,[0-9],/g, ",[0-9]."); 
    while(csv_temp.indexOf('\n\n') >-1){
      csv_temp = csv_temp.replace('\n\n', '\n');
      }    
    console.log(csv_temp);


    fs.writeFile('/home/talles/Documents/v1.2.2/projects/test-summarization/results/results.csv', csv_temp, (err) =>{

      if(err) return console.log(err);
      })

    })

    
      console.log("Projeto directório:" + properties.get('project.dir'));
      console.log("Ngram:" + properties.get('ngram'));
      properties.set('project.dir', '/projeto/');
      console.log("Projeto directório:" + properties.get('project.dir'));


    let csvFilePath = "/home/talles/Documents/v1.2.2/projects/test-summarization/results/results.csv"
    csv()
   .fromFile(csvFilePath)
   .then((jsonObj)=>{      
             result.push(jsonObj.toString());          
         })

         console.log(); 
 
 */
    

  /* 
var buffer = Buffer(50)
var writeStream = fs.createWriteStream('res.csv');
var stream = fs.createReadStream('/home/talles/Documents/v1.2.2/projects/test-summarization/results/results.csv')
.pipe(csv())
.then((json) =>{

    console.log(json)
    
    
}) 
*/

// console.log("Json1: " + json_2)


//Resolver problema da string das vírgulas
 


/*
  fs.readFile('/home/talles/Documents/rouge.properties','utf8', function(err, data){

    if(err)
        return console.log(err);
        temp = data;
        temp = temp.toString().replace("project.dir=/home/talles/Documents/v1.2.2/projects/test-summarization", "project.dir=/home/talles/Documents/v1.2.2/projects/test-summarization");
        console.log(temp);

    fs.writeFile('/home/talles/Documents/rouge.properties', temp, function(err,){

      if(err) return console.log(err);

      console.log("Updated");

    })

  })
 
  fs.readFile('/home/talles/Documents/v1.2.2/projects/test-summarization/results/results.csv','utf8', function(err, data){

    if(err)
        return console.log(err);
        temp = data;
        while(temp = temp.toString().replace(',0,', ',0.'));
        console.log(temp);

    fs.writeFile('/home/talles/Documents/v1.2.2/projects/test-summarization/results/results.csv', temp, function(err){

      if(err) return console.log(err);

      console.log("Updated");

   })

  })
*/

/*
const { exec } = require("child_process");

exec("java -jar -Drouge.prop=/home/talles/Documents/rouge2222.properties /home/talles/Documents/rouge_interface/v1.2.2/rouge2-1.2.2.jar", (error, stdout, stderr) => {
    if (error) {
        console.log(`error: ${error.message}`);
        return;
    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
    }
    console.log(`stdout: ${stdout}`);
});*/

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
