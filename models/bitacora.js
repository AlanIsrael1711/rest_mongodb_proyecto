import mongoose from "mongoose";
const Schema = mongoose.Schema;

mongoose.pluralize(null);

const bitacoraSchema = new Schema({
  fecha: {
    type: Date,
    default: Date.now,
  },
  tabla: {
    type: String,
    required: true,
    trim: true,
  },
  accion: {
    type: String,
    required: true,
    trim: true,
  },
  descripcion: {
    type: String,
    trim: true,
    maxlength: 300,
  },
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "usuario",
  },
});

const Bitacora = mongoose.model("bitacora", bitacoraSchema);
export { Bitacora };
