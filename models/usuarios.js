var mongoose = require('mongoose');

var Schema = mongoose.Schema;


var UsuarioSchema = new Schema(
    {
      nome: {type: String, required: true, minlength:5, maxlength: 100},
      email: {type: String, required: true, minlength:3, maxlength: 100},
      senha: {type: String, required: true, minlength:5, maxlength: 100},
      data_criacao :{type: Date, defautl: Date.now},
    }
  );
    
  //Export model
  module.exports = mongoose.model('Usuario', UsuarioSchema);