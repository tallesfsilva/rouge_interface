require('dotenv').config()
var express = require('express');
var router = express.Router();
const axios = require('axios');
const fetch = require('node-fetch');
const csv = require('csv-parser');
const fs = require('fs');
const jwt = require('jsonwebtoken');


const Session = require('../models/session');
 
const port = process.env.PORT || '3000';


let result = []
/* GET home page. */
var api_controller = require('../controllers/apiController');

//Refatorar incluir todos os cenários possíveis
//Toda vez access token é gerado - corrigir isso
function authenticateToken(req, res, next) {
console.log(req.cookies.session);
 if(req.cookies.session){
      let cookie = JSON.parse(req.cookies.session);
      const session_id = cookie.s_id;
      Session.findOne({'_id' : session_id}) 
      .exec(function(err,session) {
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
              next()
          })
        }).catch(err => { console.log(err)});  
}else{
    res.redirect('/login');
}
}) 
  }else if(req.headers['authorization']){
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null) return res.sendStatus(401)
  
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
      console.log(err)
      if (err) return res.sendStatus(403)
      req.user = user;
      req.token = token;
      
      next();
    })  
   }else{
    //Resposta deve ser 403 ou 401, não 302
    res.redirect('/login');
    }
}

router.get('/home', authenticateToken, function(req, res, next) {
 
    console.log("Token" + req.token);
    
    res.render('home', {token: req.token}); 
  });


router.get('/', function(req, res, next) {


      res.redirect('/login'); 
     // res.render('login');
});

router.get('/login', api_controller.api_login_get) ;
router.post('/login', api_controller.api_login_post) ;
router.get('/logout', api_controller.api_logout) ;
router.get('/novo_projeto', authenticateToken, api_controller.api_novo_projeto);
router.post('/novo_projeto', authenticateToken, api_controller.api_rouge_prepara) ;
router.get('/perfil', authenticateToken, api_controller.api_perfil) ;
router.get('/corpus', authenticateToken, api_controller.criar_corpus) ;

router.post('/perfil', authenticateToken, api_controller.api_perfil_post) ;
router.get('/sobre', authenticateToken, api_controller.api_sobre) ;
router.get('/configuracoes', authenticateToken, api_controller.api_configuracoes) ;

router.get('/registrar', api_controller.api_user_registrar_get);

router.get('/projeto/:id', authenticateToken, api_controller.api_projeto_detalhe);
router.get('/projetos', authenticateToken, api_controller.api_lista_projetos);

router.post('/registrar', api_controller.api_user_registrar_post);


module.exports = router;
