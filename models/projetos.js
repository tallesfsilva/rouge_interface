var mongoose = require('mongoose');

var Schema = mongoose.Schema;


var ProjetoSchema = new Schema(
    {
      usuario: {type: Schema.Types.ObjectId, ref: 'Usuario', required: true},
      nome : {type: String, required :true, maxlength: 50},
      dataCriacao: {type: Date,  default: Date.now("01-01-2020"), required: true},
    }
  );
  
  ProjetoSchema
  .virtual('url')
  .get(function () {
    return '/projeto/' + this._id;
  });
  

  //Export model
  module.exports = mongoose.model('Projeto',ProjetoSchema);