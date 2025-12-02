import mongoose from "mongoose";
const Schema = mongoose.Schema;

mongoose.pluralize(null);

const compradorSchema = new Schema({
  codigo_cpr: {
    type: Number,
    required: true,
    unique: true
  },
  nombre: {
    type: String,
    trim: true,
    maxlength: 15,
    required: true
  },
  apellido_paterno: {
    type: String,
    trim: true,
    maxlength: 15
  },
  apellido_materno: {
    type: String,
    trim: true,
    maxlength: 15
  },
  direccion: {
    type: String,
    trim: true,
    maxlength: 200
  },
  correo: {
    type: String,
    trim: true,
    lowercase: true,
    maxlength: 80,
    unique: true
  },
  telefono: {
    type: String,
    trim: true,
    maxlength: 20
  }
});

const Comprador = mongoose.model("comprador", compradorSchema);
export { Comprador };