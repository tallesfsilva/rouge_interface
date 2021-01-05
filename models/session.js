var mongoose = require('mongoose');

var Schema = mongoose.Schema;


var SessionSchema = new Schema(
    {
      usuario: {type: Schema.Types.ObjectId, ref: 'Usuario', required: true},
      dataCriacao: {type: Date,  default: Date.now, required: true},
      refreshToken: {type: JSON, required: true},
      loggedIn: {type: Boolean, required: true},
      sessionExpires : {type: Date, required: true}
    }
  );
  
  
  //Export model
  module.exports = mongoose.model('Session',SessionSchema);