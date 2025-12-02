import mongoose from "mongoose";
const Schema = mongoose.Schema;

mongoose.pluralize(null);

const loteSchema = new Schema({
  id_lte: {
    type: Number,
    required: true,
    unique: true
  },
  kilos: {
    type: Number,
    required: true,
    min: 0
  },
  numero_cajas: {
    type: Number,
    min: 0
  },
  precio_kilo_salida: {
    type: Number,
    required: true,
    min: 0
  },
  fecha: {
    type: Date,
    default: Date.now
  },
  id_epe: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "especie",
    required: true
  },
  vendido: {
    type: Boolean,
    default: false
  }
});

const Lote = mongoose.model("lote", loteSchema);
export { Lote };