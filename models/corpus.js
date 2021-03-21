var mongoose = require('mongoose');

var Schema = mongoose.Schema;


var CorpusSchema = new Schema(
    {
      usuario: {type: Schema.Types.ObjectId, ref: 'Usuario', required: true},
      nome_corpus : {type: String, required :true, maxlength: 50},
      categoria : {type: String, required :true, maxlength: 100},
      descricao : {type: String, required :true, maxlength: 500},
      dataCriacao: {type: Date,  default: Date.now("01-01-2020"), required: true},
      compartilha : {type: Boolean, default: false}
   }
  );
  
  CorpusSchema
  .virtual('url')
  .get(function () {
    return '/corpus/' + this._id;
  });
  

  //Export model
  module.exports = mongoose.model('Corpus',CorpusSchema);