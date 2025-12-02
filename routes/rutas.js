import express from "express";
import {
  crearUsuario,
  login,
  consultaUsuario,
  consultaUsuarioId,
  actualizarUsuario,
  eliminarUsuario,
  crearCompra,
  consultaCompra,
  consultaCompraId,
  actualizarCompra,
  eliminarCompra,
  crearComprador,
  consultaComprador,
  consultaCompradorId,
  actualizarComprador,
  eliminarComprador,
  crearTipo,
  consultaTipo,
  consultaTipoId,
  actualizarTipo,
  eliminarTipo,
  crearLote,
  consultaLote,
  consultaLoteId,
  actualizarLote,
  eliminarLote,
  crearEspecie,
  consultaEspecie,
  consultaEspecieId,
  actualizarEspecie,
  eliminarEspecie,
  activarEspecie,
  consultaBitacoraDia,
  consultaBitacoraRango,
} from "../controller/api.js";

const router = express.Router();

// usuarios
router.post("/crearUsuario", crearUsuario);
router.post("/login", login);
router.get("/usuarios", consultaUsuario);
router.get("/usuarios/:id", consultaUsuarioId);
router.put("/usuarios/:id", actualizarUsuario);
router.delete("/usuarios/:id", eliminarUsuario);

// compra
router.post("/crearCompra", crearCompra);
router.get("/consultaCompra", consultaCompra);
router.get("/consultaCompra/:id", consultaCompraId);
router.put("/actualizarCompra/:id", actualizarCompra);
router.delete("/eliminarCompra/:id", eliminarCompra);

// comprador
router.post("/crearComprador", crearComprador);
router.get("/consultaComprador", consultaComprador);
router.get("/consultaComprador/:id", consultaCompradorId);
router.put("/actualizarComprador/:id", actualizarComprador);
router.delete("/eliminarComprador/:id", eliminarComprador);

// tipo
router.post("/crearTipo", crearTipo);
router.get("/consultaTipo", consultaTipo);
router.get("/consultaTipo/:id", consultaTipoId);
router.put("/actualizarTipo/:id", actualizarTipo);
router.delete("/eliminarTipo/:id", eliminarTipo);

// lote
router.post("/crearLote", crearLote);
router.get("/consultaLote", consultaLote);
router.get("/consultaLote/:id", consultaLoteId);
router.put("/actualizarLote/:id", actualizarLote);
router.delete("/eliminarLote/:id", eliminarLote);

// especie
router.post("/crearEspecie", crearEspecie);
router.get("/consultaEspecie", consultaEspecie);
router.get("/consultaEspecie/:id", consultaEspecieId);
router.put("/actualizarEspecie/:id", actualizarEspecie);
router.put("/eliminarEspecie/:id", eliminarEspecie);
router.put("/activarEspecie/:id", activarEspecie);

// bitacora
router.get("/bitacora/dia", consultaBitacoraDia);
router.get("/bitacora", consultaBitacoraRango);

export default router;
