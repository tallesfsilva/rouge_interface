
require('dotenv').config()
const fs = require('fs');
const fse = require('fs-extra')
const csv = require('csv-parser');
var Usuario = require('../models/usuarios');
var Session = require('../models/session');
var Projeto = require('../models/projetos');
var Resultado = require('../models/resultado');
var Token  = require('../models/token');
const path = require('path');
var async = require('async');
const util = require('util');

const port = process.env.PORT || '3000';


const md5 = require('md5');
const { body,validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');
var propertiesReader = require('properties-reader');
const { resolve } = require('path');
const { json } = require('express');
const { RSA_NO_PADDING } = require('constants');
var properties = propertiesReader('rouge/rouge.properties');


let results = [];


exports.api_login_post = (req,res,next) =>{

  try{
    Usuario.findOne({'email': req.body.email})
    .exec(function(err, results){ 
        console.log(results);      
        if(err) return next(err);      
        if (results && (results.email == req.body.email)) {
             Session.findOne({'usuario' : results}) 
             .exec(function(err,session) {               
                if(err) {
                    console.log(err);
                    res.render('login', {"success": false, "user": null, "message": "Ocorreu um problema na conexão com o banco de dados"});
                 }
                 if((session==null || session==undefined) &&
                         (md5(req.body.senha) ==results.senha)){                         
                            fetch("http://localhost:"+port+"/api/session/", {
                                method: 'POST',
                                headers: {
                                'Content-Type': 'application/json',       
                                },
                                mode : 'cors',        
                                body : JSON.stringify({usuario:  results}),
                            })
                            .then (response => response.json())
                            .then(data => {                               
                                let cookieValue = JSON.stringify({'s_id': data.session._id, 'id': data.session.usuario});
                               res
                               .status(201)
                               .cookie('session',cookieValue,{
                               /* expires: new Date(Date.now() + 8 * 3600000) ,*/ httpOnly: true
                               })                      
                               .redirect('home');     
                            
                            }).catch (err => {   
                                console.log(err);
                                res.render('login', {"success": false, "user": null, "message": "Ocorreu um problema no login. Por favor tente novamente"});
                            });
                }else if ((session && session.refreshToken) 
                            && (md5(req.body.senha) == results.senha)) {   
                                                                                                
                            fetch("http://localhost:"+port+"/api/token", {    
                                    method: 'POST',
                                    headers: {
                                        'Accept': 'application/json',
                                        'Access-Control-Allow-Origin' : '*',
                                    'Content-Type': 'application/json',          
                                    },
                                    mode : 'cors',
                                
                                    body : JSON.stringify({"refreshToken" : session.refreshToken}),
                                })
                                .then(response => response.json())
                                .then (token => {                                        
                                    let tokenTemp = session.refreshToken;
                                    delete session.refreshToken;
                                    let cookieValue = JSON.stringify({'s_id': session._id, 'id': results._id});
                                    res
                                    .status(201)
                                    .cookie('session',cookieValue,{
                                    /*expires: new Date(Date.now() + 8 * 3600000),*/ httpOnly: true 
                                    })                                                               
                                    .redirect('home');     
                            
                                }).catch (err => {                                    
                                    console.log(err);                                    
                                    res.render('login', {"success": false, "user": null, "message": "Ocorreu um problema no login. Por favor tente novamente"});
                                    
                                 });              
                } else {
                    res.render('login', {"success": false, "user": null, "message": "Usuario ou senha incorretos"});
                }                      
        })

     } else{
        res.render('login', {"success": false, "user": null, "message": "Usuário não existe no banco de dados"});
        }
    });
  } catch(e){
        res.render('login', {"success": false, "user": null, "message": "Ocorreu o um problema na requisição. Por favor recarregue a página"});
  }
    
}

exports.api_login_get = (req,res,next) =>{
  
       
    if(req.cookies.session){
        const sessionId = JSON.parse(req.cookies.session);
        console.log(sessionId.id);
        console.log(sessionId);
        Session.findOne({'_id' : sessionId.s_id}) 
        .exec(function(err,session) {  
            console.log("session" +  session)      
            if(err) return console.log(err)
            if(session && session.refreshToken){
                 console.log("Autenticação:" +  session)
                //Refatorar para função - toda geração do token tratato via backend
                    fetch("http://localhost:"+port+"/api/token", {    
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Access-Control-Allow-Origin' : '*',
                    'Content-Type': 'application/json',          
                    },
                    mode : 'cors',

                    body : JSON.stringify({"refreshToken" : session.refreshToken}),
            })
            .then(response => response.json())
            .then (token => {        
          //console.log(token);
          jwt.verify(token.accessToken, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
              //console.log(err)
              if (err) return res.sendStatus(403)
              req.user = user;
              req.token =token;  
              req.idUser = session.usuario;
              res.redirect('/home');
        })
      }).catch(err => { console.log(err)});  
    }else if((session==null || session==undefined)){ 
   
            try{
                console.log("entrei aqui!");  
                Usuario.findOne({'_id': sessionId.id})
                .exec(function(err, results){ 
                console.log("usuario" + results);      
                if(err) return next(err);      
                if (results) {                                    
                   fetch("http://localhost:"+port+"/api/session/", {
                                    method: 'POST',
                                    headers: {
                                    'Content-Type': 'application/json',       
                                    },
                                    mode : 'cors',        
                                    body : JSON.stringify({usuario:  results}),
                                })
                                .then (response => response.json())
                                .then(data => {                               
                                    let cookieValue = JSON.stringify({'s_id': data.session._id, 'id': data.session.usuario_id});
                                   res
                                   .status(201)
                                   .cookie('session',cookieValue,{
                                   /* expires: new Date(Date.now() + 8 * 3600000) ,*/ httpOnly: true
                                   })                      
                                   .redirect('home');     
                                
                                }).catch (err => {   
                                    console.log(err);
                                    res.render('login', {"success": false, "user": null, "message": "Ocorreu um problema no login. Por favor tente novamente"});
                                });      
}else{
    res.render('login'); 
}
})
        }catch(err){
            res.render('login');
        }
} else{
    res.render('login'); 
} 
        });
}else{
    res.render('login'); 
}
}

exports.api_user_registrar_get = (req,res,next) =>{

    res.render('registrar', {"success": true, "method": 'get', "api" : "/registrar"});
}

exports.api_logout = (req,res,next) => {
   
    if(req && req.cookies.session){
        let cookie = JSON.parse(req.cookies.session);
        const session_id = cookie.s_id;          
         
        Session.findOneAndDelete({'_id' : session_id}) 
          .exec(function(err,session) {
            if(err){
                console.log(err)
                res.redirect('login');
            } 
              if(session){  
                let cookieValue = JSON.stringify({'s_id': session._id, 'id': session.usuario});             
                  //console.log(session);
                  res.cookie('session',cookieValue,{expires: new Date(Date.now())})
                  .redirect('login');                  
              }
        })
    }
}

exports.api_perfil = (req,res,next) => {
      
        if(req && req.cookies.session){   
             Usuario.findOne({'_id' : req.idUser})
             .exec( (err, result) =>{
        if(result){
                    res.render('perfil', {success: true, usuario: result});
                }else{
                    res.render('perfil', {success: false, message: "Usuário não encontrado"});
        }
        })
    }else{
        res.render('perfil', {success: false, message: "Requição inválida"});
    }

      

}

exports.api_user_registrar_post =  [
                
                body('nome', 'O nome deve ter no mínimo 5 caracteres.').trim().isLength({ min: 5 }).escape(),
                body('nome', 'Nome não pode ser vazio').trim().isLength(0).escape(),
                body('email', 'Email inválido.').trim().isEmail().normalizeEmail(),
                body('senha', 'Senha inválida. Mínimo 5 caracteres.').trim().isLength({ min: 5 }).escape() ||
                body('senha_2', 'Senha inválida. Mínimo 5 caracteres').trim().isLength({ min: 5 }).escape(),
                body('senha', "As senhas não são iguais").custom((value, {req}) => value === req.body.senha_2),

                (req,res,next) =>{
                   if(req && req.body && req.headers){
                     const user = {name: req.body.email}; 
                        const errors = validationResult(req);
                        var usuario = new Usuario({
                            
                            nome : req.body.nome,
                            email : req.body.email,
                            senha : md5(req.body.senha),
                        });
                    if(!errors.isEmpty()){                   
                        res.render('registrar', {success: false, body: true, message : errors.array()}); 
                    }else{
                        Usuario.findOne({'email' : req.body.email})
                        .exec( (err, result) =>{
                            console.log(result);
                            if(err) return console.log(err);
                            if(result===null || result===undefined){
                                usuario.save((err) =>{                                
                                    if(err) return res.render('registrar', {success : false, message : "MongoDB: " + err, "origem": "back"});
                                
                                    fetch("http://localhost:"+port+"/api/session/", {
                                        method: 'POST',
                                        headers: {
                                        'Content-Type': 'application/json',       
                                        },
                                        mode : 'cors',        
                                        body : JSON.stringify({usuario:  usuario}),
                                    })
                                    .then (response => response.json())
                                    .then(data => {    
                                        console.log(data);  
                                        let cookieValue = JSON.stringify({'s_id': data.session._id, 'id': data.session.usuario});                                 
                                        res 
                                    .cookie('session',cookieValue, {
                                        /*expires: new Date(Date.now() + 8 * 3600000),*/ httpOnly: true 
                                        })
                                        .redirect('home'); 
                                        
                                    
                                        
                                }).catch(err => {res.render('registrar', {success: false, message :"Não foi possível criar a sessão", errors: err})});                    
                                })
                            }else{
                                res.render('registrar', {success: false, mongo: true, "message" : "O email informado já possui um registro.", errors: err});
                            }
                        });                   
                    }

                }else{
                    res.render('registrar', {success: false, "message" : "Ocorreu um erro na requição"});
                }
}
];

exports.api_gera_token = (req, res) => {
    const refreshToken = req.body.refreshToken;    
    if (refreshToken == null) return res.sendStatus(401) 
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {     
      if (err) return res.sendStatus(403)
      const accessToken = geraAccessToken({ name: user.name });   
      res.setHeader('Access-Control-Allow-Origin', '*');   
      res.json({accessToken: accessToken})
    })
  }


exports.api_session_criar = function ( req, res, next ) {
   
    if (req && req.body.usuario.email){
        const user = {name: req.body.usuario.email};  
        
        const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);
        console.log("Refresh token: " + refreshToken);                      
        console.log("API: Session: Criar - /api/session/");
        
        var session = new Session({
            usuario  : req.body.usuario,
            refreshToken : refreshToken,
            loggedIn : true,
            sessionExpires : Date.now() + 2,
        })                
    Session.findOne({ 'usuario': req.body.usuario._id})
    .populate('usuario')
    .exec( function(err, found_user) {
       if (err) { return next(err); }
        if(found_user){        
            res.json({session: found_user, "success": false, "message": "Sessão já existe"});      
        }else{               
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
        session.save(function(err){
                if(err) res.json({"success" : false, message : "Não foi possível salvar a sessão", erro: err});
                             
                res.json({session})
             
                   
                    
            })

        }
    });
}else{
    res.json({"success" : false, "headers" : "not presented"});
}

};


function geraAccessToken(user) {

    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '86400s' })
  }
  

function formataRougeProperties(arquivoProperties){

    return new Promise((resolve, reject) =>{
        try{
            if(properties && arquivoProperties){            
                    properties.set('project.dir', path.join(process.cwd() +'/' + arquivoProperties.project_dir));
                    properties.set('outputFile', path.join(process.cwd() +'/' + arquivoProperties.outputFile + '/' + 'result.csv'));
                    properties.set('beta', arquivoProperties.beta);
                    properties.set('ngram', arquivoProperties.ngram);
                    properties.set('rouge.type', arquivoProperties.rouge_type);
                    properties.set('stopwords.use', arquivoProperties.stopwords_use);
                    properties.set('stopwords.file', arquivoProperties.stopwords_file);
                    properties.set('topic.type', arquivoProperties.topic_type);
                    properties.set('synonyms.use', arquivoProperties.synonyms_use);
                    properties.set('pos_tagger_name', arquivoProperties.post_tagger);
                    properties.set('stemmer.name', arquivoProperties.stemmer_name);
                    properties.set('stemmer.use', arquivoProperties.stemmer_use);

                    
                    //console.log("Projeto directório:" + properties.get('project.dir'));
            
                    let rougeProperties = JSON.stringify(properties._properties);
                    rougeProperties = rougeProperties.replace(/":"/g, "=")
                    .replace(/","/g, "\n")
                    .replace(/"}/g, "")
                    .replace(/{"/g, ""); 
                
                    try{
                        if(rougeProperties){
                            fs.writeFileSync(arquivoProperties.project_dir + '/rouge.properties', rougeProperties);                      
                            resolve({success: true, message: "rouge.properties criado"})            
                        }
                    }catch(err){
                        reject({success : false, message : "Não foi possível gravar o rouge.properties"});
                    }     
        }
        }catch(err){
                    reject({success: false, message: "Execução não foi possível"});
        }
 }).catch((err) => {    
    return console.log(err);

});
}


function criaDiretorios(idProjeto){

   return new Promise((resolve,reject) =>{ 
        try{
            if(idProjeto && idProjeto!=null && idProjeto!=undefined){
                    try{
                        fs.mkdirSync('projetos/' + idProjeto + '/results', { recursive: true });
                        fs.mkdirSync('projetos/' + idProjeto + '/reference', { recursive: true });
                        fs.mkdirSync('projetos/' + idProjeto + '/system', { recursive: true });
                        resolve({success: true, message: "Diretórios results, reference e system criados"})
                    }catch(err){
                        reject({success: false, message: "Não foi possível criar os diretórios"})
                    }                 
                }
         } catch(err){
                        reject({success: false, message: "Não foi possível criar o diretório /system"})
                }         
        }).catch(err =>{
           return console.log(err);
        });

};

/*
function execRouge(projetoPath){
    return new Promise((resolve,reject) =>{
        try{       
            const { spawn} = require("child_process");
            let rougeProperties = path.join(process.cwd() +'/' + projetoPath + '/' + 'rouge.properties');
            console.log(rougeProperties);
            try{ 
                if(rougeProperties){             
                        const ls = spawn('java', ['-jar','-Xmx5048m','-Drouge.prop=' + rougeProperties.toString(), path.join(process.cwd().toString() + '/rouge/rouge2-1.2.2.jar')]);
                        
                        process.on('close', (code) => {
                        return console.log("ROUGE executado");
                        });

                         }            
                         
            } catch(err){
                reject({success:false, message : err});
            }
        } catch(err){
            reject({success:false, message : "Não foi possível iniciar o processo de execução", error: err})
  
        }    
    }).catch(err => {
        console.log(err);
    })   
  
  }
*/
function execRouge(projetoPath){

    return new Promise((resolve,reject) =>{
        try{       
            const { exec} = require("child_process");
            let rougeProperties = path.join(process.cwd() +'/' + projetoPath + '/' + 'rouge.properties');
            console.log(rougeProperties);
            try{ 
                if(rougeProperties){             
                        const ls = exec('java -jar -Xmx4048m -Drouge.prop=' + rougeProperties.toString() + ' ' + path.join(process.cwd().toString() + '/rouge/rouge2-1.2.2.jar'), (error, stdout, stderr) => {
                        if (error) {
                            reject({success:false, message : "Não foi possível executar o ROUGE2", error: error})
                            
                        }                    
                         console.log(`stderr: ${stderr}`);                
                          console.log(`stdout: ${stdout}`);                          
                         }); 
                         
                        ls.on('exit', function (code) {
                            resolve({success:true, message : "ROUGE foi executado corretamente"})
                           
                        });           
                     };
            } catch(err){
                reject({success:false, message : "Não foi possível executar o ROUGE2", err :err})
            }
        } catch(err){
            reject({success:false, message : "Não foi possível iniciar o processo de execução", error: err})

        }

 }).catch(err => {
    return console.log(err);

});
}


function gravaArquivos(reference,system, projetoPath){

    return new Promise((resolve,reject) => {
        try{           
         if(reference.length===undefined && projetoPath){
            try{
                fs.writeFileSync(projetoPath +'/reference/' +reference.name , reference.data, (err)=> {      
                    if(err) reject({success: false, message: "Não foi possível gravar o arquivo reference", erro: err});                                           
            })
            } catch{
                reject({success: false, message: "Não foi possível gravar o arquivo reference"});
            }
            }else if(reference.length && projetoPath){
                try{
                    for(let i=0;i<reference.length;i++){
                        fs.writeFileSync(projetoPath +'/reference/' +reference[i].name , reference[i].data, (err)=> {      
                                if(err) reject({success: false, message: "Não foi possível gravar o arquivo reference", erro: err});                                           
                        })
                    };  
                } catch(err){
                    reject({success: false, message: "Não foi possível gravar o arquivo reference"});
                    }
                }
                if(system.length===undefined && projetoPath){
                    try{
                        fs.writeFileSync(projetoPath +'/system/' + system.name , system.data, (err)=> {      
                            if(err) reject({success: false, message: "Não foi possível gravar o arquivo system"});
                    })
                    }catch{
                        reject({success: false, message: "Não foi possível gravar o arquivo reference"});
                    }
                } else if(system.length && projetoPath){
                    try{
                        for(let i=0;i<system.length;i++){
                            fs.writeFileSync(projetoPath +'/system/' + system[i].name , system[i].data, (err)=> {      
                                    if(err) reject({success: false, message: "Não foi possível gravar o arquivo system"});
                            })
                        }
                    } catch(err){
                        reject({success: false, message: "Não foi possível gravar o arquivo system"});
                    }
                }
                resolve({success: true, message: "Arquivos system e reference gravados corretamente"});
 } catch(err){
          return console.log(err);
        }
}).catch(err => {
    return console.log(err);
})

}

function gravaArquivosCorpus(system, corpus_dataset, projetoPath){

    return new Promise((resolve,reject) => {
        try{           
         if(projetoPath && corpus_dataset){
            try{
                fse.copy(path.join(process.cwd().toString() + '/rouge/corpus/' + corpus_dataset +'/reference/'), projetoPath +'/reference/', err=>{
                    if(err) reject({success: false, message: "Não foi possível gravar o corpus", erro: err});                                           
                })                
            
            } catch{
                reject({success: false, message: "Não foi possível corpiar o corpus - try"});
            }
            }
                if(system.length==undefined && projetoPath){
                    try{
                        fs.writeFileSync(projetoPath +'/system/' + system.name , system.data, (err)=> {      
                            if(err) reject({success: false, message: "Não foi possível gravar o arquivo system"});
                    })
                    }catch{
                        reject({success: false, message: "Não foi possível gravar o arquivo reference"});
                    }
                } else if(system.length && projetoPath){
                    try{
                        for(let i=0;i<system.length;i++){
                            fs.writeFileSync(projetoPath +'/system/' +'task1' +'_'+ system[i].name.split('_').join("") , system[i].data, (err)=> {      
                                    if(err) reject({success: false, message: "Não foi possível gravar o arquivo system"});
                            })
                        }
                    } catch(err){
                        reject({success: false, message: "Não foi possível gravar o arquivo system"});
                    }
                }
                resolve({success: true, message: "Arquivos system e reference gravados corretamente"});
 } catch(err){
          return console.log(err);
        }
})

}


const validaReference = (reference) => {
    if(reference){       
        if(!reference.length) {            
            return (reference.mimetype == 'text/plain' &&
            reference.name.split(".")[1] == "txt" && reference.name.match(/\w_\w/g)) ? true : false;

        }else {
            for(i=0;i<reference.length;i++){                
                if(reference[i].mimetype == 'text/plain' &&
                        reference[i].name.split(".")[1] == "txt" && reference[i].name.match(/\w_\w/g)){                         
                }else{
                return false;
                 }
            }        
        }
        return true;
    }else{
        return false;
    }
        
}
function validaSystem(system){ 
    if(system){
        if(!system.length){
            return (system.mimetype == 'text/plain' &&
            system.name.split(".")[1] == "txt" && system.name.match(/\w_\w/g)) ? true : false;
        }else{                 
                for(i=0;i<system.length;i++){
                    if(system[i].mimetype == 'text/plain' &&
                    system[i].name.split(".")[1] == "txt" && system[i].name.match(/\w_\w/g)){                                
                    }else{
                        return false;
                    }
            }
        }
            return true;
    }else{
        return false;
    }    

}

function formataNgram(string){
    return string.replace(/ /g,"").split(",").
    map((a) => {return a.replace(/^[0-9]+|^S[0-9]+|^SU[0-9]+|^[L]/g,"")}).join("")==""
}
/*
function formataNgram(ngram){
    let count = 0;
    if(ngram){
        //Verificar como criar um regex com o padrão N,SN,SUN,L
        //Verificar repetições
        console.log(ngram);
        for(let i=0; i<ngram.length;i++){            
            if((parseInt(ngram[i]))){}
            else if(ngram[i].split('')[0]=='S' && 
            ngram[i].split('')[1]==parseInt(ngram[i].split('')[1])){}
            else if((ngram[i].split('')[0]=='S' && ngram[i].split('')[1]=='U'
            && ngram[i].split('')[2]==parseInt(ngram[i].split('')[2]))){}
            else if(ngram[i]=='L'){}           
            else{
                return false;
            }            
        }
            return true;
    }
}*/


let arquivoProperties = {
    ngram: '',
    beta: '',
    stopwords_use: '',
    synonyms_use: '',
    stemmer_use: '',
    rouge_type: '',
    post_tagger: '',
    stemmer_name: '' ,
    project_dir : '',
    outputFile : '',
    stopwords_file : '',
    topic_type : '',
}
exports.api_rouge_prepara = (req,res,next) =>{ 
    if(req && req.user.name && req.token){
        console.log(req.body);     
        arquivoProperties.ngram = req.body.ngram=='' ? properties.get('ngram') : req.body.ngram;
        arquivoProperties.beta = parseFloat(req.body.beta) || parseFloat(properties.get('beta'));
        arquivoProperties.rouge_type = req.body.rouge_type || properties.get('rouge.type');
        arquivoProperties.post_tagger = req.body.post_tagger || properties.get('pos_tagger_name');
        arquivoProperties.stemmer_name = req.body.stemmer_name || properties.get('stemmer.name');
        arquivoProperties.synonyms_use = req.body.synonyms_use ? true : properties.get('synonyms.use');
        arquivoProperties.stemmer_use = req.body.stemmer_use ? true : properties.get('stemmer.use');
        arquivoProperties.stopwords_use = req.body.stopwords_use ? true :  properties.get('stopwords.use');
        arquivoProperties.stopwords_file =  path.join(process.cwd() + '/'+'rouge/resources/stopwords-rouge-default.txt');
        let topicArray = [];
       // console.log(req.body.topic_type.length)
        //Implementar função que trate um elemento 
        arquivoProperties.topic_type = (req.body.topic_type ? req.body.topic_type.join("|") : req.body.topic_type) || properties.get('topic.type');
        console.log(arquivoProperties.topic_type);
        let corpus = req.body.corpus;
        let corpus_dataset = req.body.corpus_dataset;
        console.log(corpus_dataset);
        console.log(corpus);
        //Verifica se usuário quer utilizar corpus
        if(corpus && corpus!=null && corpus!=undefined && corpus_dataset 
            && corpus_dataset!=undefined && corpus_dataset!=null){
            let system = req.files.system;
            let ngramValida = formataNgram(arquivoProperties.ngram);
            let systemValida = validaSystem(system);        
            console.log("Utilizando corpus");
            if(!ngramValida){
                res.render('rouge_page',{success : false,message :"Ngram inválido. Por favor insira a métrica correta."});     
             }else if(!systemValida){        
                res.render('rouge_page',{success : false,message :"Arquivos inválidos. Verifique se formato de arquivo é txt ou se o nome do arquivo é 'aaaaa_aaaaa'."});
             }else{ 
                    Usuario.findOne({'email' : req.user.name})
                    .exec((err,usuario)=>{
                            if(err) console.log(err)                      
                            if(usuario!=null && usuario!=undefined && 
                            (req.body.projeto!=undefined && req.body.projeto!=null && req.body.projeto!="")
                             ){                                                        
                                    var projeto = new Projeto({                            
                                        usuario : usuario,
                                        nome:   req.body.projeto,
                                    })
                                    projeto.save((err) =>{
                                        if(err) res.json({success : false,message :"Não foi possível salvar o projeto"});           
                                                            
                                    
                                        let projetoPath = 'projetos/' + projeto._id;
                                        let projetoOutput = 'projetos/' + projeto._id + '/results';
                                        arquivoProperties.outputFile = 'projetos/' + projeto._id + '/results';                                
                                        arquivoProperties.project_dir = 'projetos/' + projeto._id;
                                        console.log(arquivoProperties);
                                  
                                    //Verificar forma de parar execução caso retorno de sucesso de qualquer promise seja false
                                    //verificar porque promise não é retornada com a função de salvar    
                                    async function callRougue(){
                                            let diretorio = await criaDiretorios(projeto._id);
                                            console.log({'Diretórios criados' : diretorio.success});                         
                                    
                                            let rouge_properties = await formataRougeProperties(arquivoProperties);   
                                            console.log({'rouge.properties alterado' : rouge_properties.success});                         
                                        
                                            let arquivos = await gravaArquivosCorpus(system,corpus_dataset, projetoPath);
                                            console.log({'Arquivos refence/system gravados' : arquivos.success});
                                        
                                            let executaRouge = await execRouge(projetoPath);
                                            console.log({'Execução ROUGE concluída' : executaRouge});
                                            
                                            let result = await formataResult(projetoOutput);
                                            console.log({'Resultado formatado' : result.success});                                            
                                                
                                            let json_result = await formatJSON(projetoOutput);
                                            console.log({'JSON_Result' : json_result.success});
    
                                            //fse.removeSync(projetoPath+'/reference');
                                                        
                                            let resultado = new Resultado({
                                                projeto : projeto,
                                                medidas: json_result.result,                                            
                                            })
                                            resultado.save((err) => {
                                                if(err) res.json({success : false,message :"Não foi possível salvar o resultado"});
                                                    //console.log("Resultado salvo: " + resultado);
                                                    console.log({success:true, message: "Resultado gravado corretamente"});
                                                    if(req.headers['authorization']){                                         
    
                                                        res.json({projeto: projeto._id, resultado : resultado.medidas})
                                                     } else    {   
                                                       /* fs.writeFileSync(path.join(process.cwd() +'/' + projetoOutput+'/result.json'), json_result.result, (err)=> {      
                                                        if(err) reject({success: false, message: "Não foi possível gravar o arquivo reference", erro: err});                                                                                         
                                                    })    */                   
                                                        res.redirect('/projeto/' + projeto._id);
                                                             }
                                             });                                                               
                                                                            
                                }
                                callRougue().catch(err => console.log(err));     
            })                       
          
        }else{        
            res.json({success : false,message :"Request não disponível. Nome do projeto não pode ser nulo"});
        }
    });                 
 }
    //Usuário não utilizará corpus
    } else{   
        let reference = req.files.reference;
        let system = req.files.system;         
        let ngramValida = formataNgram(arquivoProperties.ngram);
        let referenceValida = validaReference(reference);
        let systemValida = validaSystem(system);
       
         if(!ngramValida){
            res.render('rouge_page',{success : false,message :"Ngram inválido. Por favor insira a métrica correta."});     
         }else if(!referenceValida || !systemValida){        
            res.render('rouge_page',{success : false,message :"Arquivos inválidos. Verifique se formato de arquivo é txt ou se o nome do arquivo é 'aaaaa_aaaaa'."});
         }else{ 
                Usuario.findOne({'email' : req.user.name})
                .exec((err,usuario)=>{
                        if(err) console.log(err);                      
                        if(usuario!=null && usuario!=undefined && 
                        (req.body.projeto!=undefined && req.body.projeto!=null && req.body.projeto!="")
                         ){                                                        
                                var projeto = new Projeto({                            
                                    usuario : usuario,
                                    nome:   req.body.projeto,
                                })
                                projeto.save((err) =>{
                                    if(err) res.json({success : false,message :"Não foi possível salvar o projeto"});           
                                                     
                                    let projetoPath = 'projetos/' + projeto._id;
                                    let projetoOutput = 'projetos/' + projeto._id + '/results';
                                    arquivoProperties.outputFile = 'projetos/' + projeto._id + '/results';                                
                                    arquivoProperties.project_dir = 'projetos/' + projeto._id;
                                    console.log(arquivoProperties);
                              
                                //Verificar forma de parar execução caso retorno de sucesso de qualquer promise seja false
                                //verificar porque promise não é retornada com a função de salvar    
                                async function callRougue(){
                                        let diretorio = await criaDiretorios(projeto._id);
                                        console.log({'Diretórios criados' : diretorio.success});                         
                                
                                        let rouge_properties = await formataRougeProperties(arquivoProperties);   
                                        console.log({'rouge.properties alterado' : rouge_properties.success});                         
                                    
                                        let arquivos = await gravaArquivos(reference,system,projetoPath);
                                        console.log({'Arquivos refence/system gravados' : arquivos.success});
                                    
                                        let executaRouge = await execRouge(projetoPath);
                                        console.log({'Execução ROUGE concluída' : executaRouge.success});
                                        
                                        let result = await formataResult(projetoOutput);
                                        console.log({'Resultado formatado' : result.success});                                            
                                            
                                        let json_result = await formatJSON(projetoOutput);
                                        console.log({'JSON_Result' : json_result.success});

                                                    
                                        let resultado = new Resultado({
                                            projeto : projeto,
                                            medidas: json_result.result,                                            
                                        })
                                        resultado.save((err) => {
                                            if(err) res.json({success : false,message :"Não foi possível salvar o resultado"});
                                                console.log({success:true, message: "Resultado gravado corretamente"});
                                                if(req.headers['authorization']){                                         

                                                    res.json({projeto: projeto._id, resultado : resultado.medidas})
                                                 } else {            
                                                    res.redirect('/projeto/' + projeto._id);
                                                         }
                                         });                                                               
                                                                        
                            }
                            callRougue().catch(err => console.log(err));     
        })                       
      
    }else{        
        res.json({success : false,message :"Request não disponível. Nome do projeto não pode ser nulo"});
        }
    });
 }
    }
 }else{
     res.json({success : false,message :"Não foi possível iniciar o processo"});
 }
}

exports.api_perfil_post = [

    //Se usuário quiser atualizar somente um dos campos    

    body('nome', 'O nome deve ter no mínimo 5 caracteres.').trim().isLength({ min: 5 }).escape(),
    body('nome', 'Nome não pode ser vazio').trim().isLength(0).escape(),
    body('email', 'Email inválido.').trim().isEmail(),
    body('senha', 'Senha inválida. Mínimo 5 caracteres.').trim().isLength({ min: 5 }).escape() || 
    body('senha_2', 'Senha inválida. Mínimo 5 caracteres').trim().isLength({ min: 5 }).escape(),
    body('senha', "As senhas não são iguais").custom((value, {req}) => value === req.body.senha_2),

    (req,res,next) =>{
       if(req && req.body && req.headers && req.user.name){      
            const errors = validationResult(req);          
        if(!errors.isEmpty()){                   
            res.render('perfil', {success: false, body: true, message : errors.array()}); 
        }else{    
            var usuario = new Usuario({                
                nome : req.body.nome,
                email : req.body.email,
                senha : md5(req.body.senha),
                _id : req.idUser,
            });
            Usuario.findByIdAndUpdate(req.idUser, usuario, {}, function(err,result){
                if(err) 
                res.render('perfil', {success: false, message : "MongoDB: Ocorreu um erro ao atualizar o perfil!" + err, usuario: usuario})
                console.log(result);
                res.render('perfil', {success: true, message : "Seu perfil foi atualizado!", usuario: usuario})
            });    
    }
} else{
    res.render('perfil', {success: false, message : "Ocorreu um erro ao atualizar o perfil!", usuario: usuario})
}
    }
];

exports.api_sobre = (req,res,next) =>{

            res.render('sobre');
}

exports.api_novo_projeto = (req,res,next) => {

        res.render('rouge_page');

}
//Função implementada direto no template. Avaliar forma de reduzir código
/*
function formataData(value){
    
    for(let i=0;i<value.length;i++){
        if(value){
            let data = (value[i].dataCriacao.getDate()<10 ? "0" +value[i].dataCriacao.getDate() : value[i].dataCriacao.getDate())  + "/" + mes[value[i].dataCriacao.getMonth()] + "/" + value[i].dataCriacao.getFullYear()                                                
            console.log(data);
     }
    }
    return value;
   
}*/

exports.api_projeto = (req,res,next) => {

    if(req.params.id && req.token){
        let idProjeto = req.params.id;    
        Projeto.findOne({'_id': idProjeto}, {nome:1, dataCriacao:1})
         .exec((err, projeto) =>{
            if(projeto!=null && projeto!=undefined){
                console.log("Projeto" + projeto._id);
                Resultado.findOne({'projeto' : projeto})
                .exec((err, resultado) =>{   
                    if(resultado!=null 
                    && resultado!=undefined){  
                                            
                        res.json({projeto: projeto, medidas: resultado});       
                    }else{
                        res.json({success:false, message:"Resultado não encontrado"}).status(404)
                    }        

           });
        }else{
            res.json({success:false, message:"Projeto não encontrado"}).status(404)
        }

    });
    }else{
        res.json({success:false, message:"Identificador não encontrado"}).status(404)
    }
}


exports.api_lista_projetos = (req,res) =>{
    if(req.idUser && req.token){
        let idProjeto = req.params.id;    
        Projeto.find({'usuario': req.idUser}, {nome:1, dataCriacao: 1}).sort({'dataCriacao': 'desc'})
         .exec((err, projeto) =>{
             if(err) res.render('lista_projetos', {success:false, message:"Projeto não encontrado"})
            if(projeto!=null && projeto!=undefined){  
                     
                    res.render('lista_projetos', {success: true, projeto: projeto});             
        }else{
            res.render('lista_projetos', {success:false, message:"Projeto não encontrado"})
        }

    });
    }else{
        res.render('lista_projetos', {success:false, message:"Identificador não encontrado"})
    }           

};



exports.api_projeto_detalhe = (req,res,next) => {
   
    if(req.params.id && req.token){
        let idProjeto = req.params.id;    
        Projeto.findOne({'_id': idProjeto}, {nome:1, dataCriacao:1})
         .exec((err, projeto) =>{
            if(projeto!=null && projeto!=undefined){
               // console.log("Projeto" + projeto._id);
                Resultado.findOne({'projeto' : projeto})
                .exec((err, resultado) =>{   
                    if(resultado!=null 
                    && resultado!=undefined){                    
                        res.render('projeto', {projeto: projeto, medidas: resultado});
                    }else{
                        res.json({success:false, message:"Resultado não encontrado"}).status(404)
                    }        

           });
        }else{
            res.json({success:false, message:"Projeto não encontrado"}).status(404)
        }

    });
    }else{
        res.json({success:false, message:"Identificador não encontrado"}).status(404)
    }
                   
        

};


//Verificar porque função não funciona
function salvaResult(result_json, projeto){
    
    resultado.save((err) => {
          if(err) console.log(err);
          //console.log("Resultado salvo: " + resultado);
         return {success:true, message: "Resultado gravado corretamente"};
        
  }); 
}


//Refatorar
function formataResult(projetoOutput){

    return new Promise(resolve =>{
        try{
            let csv_temp = "";        
            console.log(path.join(process.cwd() +'/' + projetoOutput));
            fs.readFile(path.join(process.cwd() +'/' + projetoOutput+'/result.csv'), 'utf8', (err, data) =>{        
                
                    if(data){
                        csv_temp = data.split("");
                    }
                    
                    for(i=0;i<csv_temp.length;i++) {
                        if((csv_temp[i]=="," && csv_temp[i+1]=="0" && csv_temp[i+2]==",") || 
                        (csv_temp[i]=="," && csv_temp[i+1]=="1" && csv_temp[i+2]==",")) {
                            csv_temp[i+2]=".";
                            }
                        } 
                    csv_temp = csv_temp.join("");
        
                    while(csv_temp.indexOf('\n\n') >-1){
                        csv_temp = csv_temp.replace('\n\n', '\n');
                     }    
                   // console.log(csv_temp);                    
                    
                 fs.writeFile(path.join(process.cwd() +'/' + projetoOutput+'/result.csv'), csv_temp, (err) =>{
                    
                        if(err) {
                            resolve({success: false, message :"Não foi possível gravar o arquivo results", erro : err});
                        }
                    })                 
                                          
                        
                            resolve({success: true, message : "Arquivo result formatado e gravado"});
                        if(err){
                            resolve({success: false, message :"Não foi possível abrir o arquivo results", erro : err});
                        }
                    })
                     
         } catch(err){
            resolve({success: false, message :"Erro ao executar operação de leitura", erro : err});
        }
    }).catch((err) =>{
        return console.log(err);

    })
}


//Retorna JSON com resultado do ROUGE
function formatJSON(projetoOutput){
    let result =[];
/// Checkar se req.usuario existe req.projeto e req.session
            return new Promise(resolve => {
                try{
                    //Checar se diretório existe
                    if(projetoOutput){     
                        fs.createReadStream(path.join(process.cwd() +'/' + projetoOutput+'/result.csv'), "utf8")
                            .pipe(csv())
                            .on('data', (jsonObj)=>    
                                results.push(jsonObj)         
                        )
                            .on('end', (err) =>{
                           
                                resolve({ result: results, success: true, message:"Arquivo result-json gerado"}); 

                               

                        }).on('end', (err) =>{
                                results = [];
                        });
                        }
                    }
                        catch(e){
                                console.log(e);
                                resolve({success: false, message: "Arquivo json não gerado"});
                        }      
                
            }).catch(err =>{
                return console.log(err);
            })

};

exports.api_configuracoes = (req,res,next) => {

    res.render('configuracoes');

}

exports.api_result = (req,res,next) => {       
      
    if(req.params.id!=null 
        && req.params.id!=undefined 
        && req.token){
        let file = path.join(process.cwd() + '/projetos/' +req.params.id + '/results/result.csv');
        res.sendFile(file);         
    }else{
        res.json({success:false, message :"Identificador não encontrado"});
    }

}
