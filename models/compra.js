import mongoose from "mongoose";
const Schema = mongoose.Schema;

mongoose.pluralize(null);

const loteCompraSubSchema = new Schema({
  id_lte: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "lote",
    required: true
  },
  kilos_comprados: {
    type: Number,
    required: true,
    min: 0
  },
  precio_kilo_final: {
    type: Number,
    required: true,
    min: 0
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0
  }
}, { _id: false });

const compraSchema = new Schema({
  id_cmp: {
    type: Number,
    required: true,
    unique: true
  },
  fecha: {
    type: Date,
    default: Date.now
  },
  id_cpr: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "comprador",
    required: true
  },
  lotes: {
    type: [loteCompraSubSchema],
    validate: [v => v.length > 0, "Debe incluir al menos un lote"]
  },
  precio_total: {
    type: Number,
    required: true,
    min: 0
  }
});

const Compra = mongoose.model("compra", compraSchema);
export { Compra };