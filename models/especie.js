import mongoose from "mongoose";
const Schema = mongoose.Schema;

mongoose.pluralize(null);

const especieSchema = new Schema({
  id_epe: {
    type: Number,
    required: true,
    unique: true
  },
  nombre: {
    type: String,
    trim: true,
    maxlength: 25,
    required: true
  },
  imagen: {
    type: String,
    trim: true
  },
  vista: {
    type: Boolean,
    default: true
  },
  id_tpo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "tipo",
    required: true
  }
});

const Especie = mongoose.model("especie", especieSchema);
export { Especie };