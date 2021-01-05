var mongoose = require('mongoose');

var Schema = mongoose.Schema;


var ResultadoSchema = new Schema(
    {
      projeto: {type: Schema.Types.ObjectId, ref: 'Projeto', required: true},
      dataCriacao: {type: Date,  default: Date.now, required: true},
      medidas : {type: JSON , require : true}
    }
  );

  
  ResultadoSchema
.virtual('url')
.get(function () {
  return '/api/resultado/' + this._id;
});

  //Export model
  module.exports = mongoose.model('Resultado',ResultadoSchema);