import mongoose from "mongoose";
const Schema = mongoose.Schema;

mongoose.pluralize(null);

const tipoSchema = new Schema({
  id_tpo: {
    type: Number,
    required: true,
    unique: true
  },
  nombre: {
    type: String,
    trim: true,
    maxlength: 30,
    required: true
  }
});

const Tipo = mongoose.model("tipo", tipoSchema);
export { Tipo };