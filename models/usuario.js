import mongoose from "mongoose";
const Schema = mongoose.Schema;

mongoose.pluralize(null);

const usuarioSchema = new Schema({
  correo: {
    type: String,
    trim: true,
    lowercase: true,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  rol: {
    type: String,
    enum: ["admin", "empleado"],
    required: true
  },
  nombre: {
    type: String,
    trim: true,
    maxlength: 50
  }
});

const Usuario = mongoose.model("usuario", usuarioSchema);
export { Usuario };