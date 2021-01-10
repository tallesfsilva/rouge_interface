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




function execRouge(){

  return new Promise((resolve,reject) =>{
      try{       
          const { spawn} = require("child_process");
          let rougeProperties = path.join(process.cwd() +'/' + 'projetos/5ffb561265dba11148a76314' + '/' + 'rouge.properties');
          console.log(rougeProperties);
          try{ 
              if(rougeProperties){             
                      const ls = spawn('java', ['-jar', '-Xprof', '-Xmx5048m','-Drouge.prop=' + rougeProperties.toString(), path.join(process.cwd().toString() + '/rouge/rouge2-1.2.2.jar')]);
                      
                      ls.stdout.on('data', (data) =>{
                        console.log(`stdout: ${data}`);
                      })
                      
                      ls.stderr.on('data', (data) => {
                        console.error(`stderr: ${data}`);
                      });

                      ls.on('erro',(err) =>{
                        reject({success:false, message : "Problema na execução do ROUGE"})

                      })
                      
                      ls.on('close', (code) => {
                             console.log(`child process exited with code ${code}`);
                          resolve({success:true, message : "ROUGE foi executado corretamente"})
                      });                       
                       }            
                   
          } catch(err){
              reject({success:false, message : "Não foi possível executar o ROUGE2"})
          }
      } catch(err){
          reject({success:false, message : "Não foi possível iniciar o processo de execução", error: err})

      }

}).catch(err => {
  reject({success:false, message : "Não foi possível iniciar o processo de execução", error: err})

});
}

//execRouge();

app.use(function(err, req, res, next) {

  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
