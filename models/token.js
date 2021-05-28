var mongoose = require('mongoose');

var Schema = mongoose.Schema;


var TokenSchema = new Schema(
    {
      usuario: {type: Schema.Types.ObjectId, ref: 'Usuario', required: true},
      acess_token_secret: {type: String, required: true, maxlength: 300},
      refresh_token_secret: {type: String, required: true, maxlength: 300},
     
    }
  );
    
  //Export model
  module.exports = mongoose.model('Token', TokenSchema);