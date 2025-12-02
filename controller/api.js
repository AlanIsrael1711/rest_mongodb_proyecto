import { Compra } from "../models/compra.js";
import { Comprador } from "../models/comprador.js";
import { Especie } from "../models/especie.js";
import { Lote } from "../models/lote.js";
import { Tipo } from "../models/tipo.js";
import { Usuario } from "../models/usuario.js";
import { Bitacora } from "../models/bitacora.js";

// bitácora
const registrarBitacora = async ({ tabla, accion, descripcion, idUsuario = null }) => {
  try {
    const registro = new Bitacora({
      tabla,
      accion,
      descripcion,
      usuario: idUsuario || null
    });
    await registro.save();
  } catch (error) {
    console.log("Error al registrar bitácora:", error);
  }
};

// usuarios
const crearUsuario = async (req, res, next) => {
  try {
    const usuario = new Usuario(req.body);
    await usuario.save();
    await registrarBitacora({
      tabla: "usuario",
      accion: "CREAR",
      descripcion: `Se creó el usuario ${usuario.correo}`
    });
    res.json({ mensaje: "Se creó el usuario", usuario });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { correo, password } = req.body;
    const usuario = await Usuario.findOne({ correo });
    if (!usuario || usuario.password !== password) {
      await registrarBitacora({
        tabla: "login",
        accion: "FALLO",
        descripcion: `Intento de login fallido para ${correo}`
      });
      return res.status(400).json({ mensaje: "Usuario o contraseña incorrectos" });
    }
    await registrarBitacora({
      tabla: "login",
      accion: "OK",
      descripcion: `Login correcto de ${usuario.correo}`,
      idUsuario: usuario._id
    });
    res.json({
      mensaje: "Login correcto",
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol
      }
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const consultaUsuario = async (req, res, next) => {
  try {
    const usuarios = await Usuario.find({});
    res.json(usuarios);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const consultaUsuarioId = async (req, res, next) => {
  try {
    const usuario = await Usuario.findById(req.params.id);
    res.json(usuario);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const actualizarUsuario = async (req, res, next) => {
  try {
    const usuario = await Usuario.findByIdAndUpdate(
      { _id: req.params.id },
      req.body,
      { new: true }
    );
    if (usuario) {
      await registrarBitacora({
        tabla: "usuario",
        accion: "ACTUALIZAR",
        descripcion: `Se actualizó el usuario ${usuario.correo}`
      });
    }
    res.json(usuario);
  } catch (error) {
    console.log(error);
    res.send(error);
    next(error);
  }
};

const eliminarUsuario = async (req, res, next) => {
  try {
    const usuario = await Usuario.findByIdAndDelete(req.params.id);
    if (!usuario) return res.status(404).json({ mensaje: "Usuario no encontrado" });
    await registrarBitacora({
      tabla: "usuario",
      accion: "ELIMINAR",
      descripcion: `Se eliminó el usuario ${usuario.correo}`
    });
    res.json({ mensaje: "Usuario eliminado" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ mensaje: "Error en servidor" });
    next(error);
  }
};

// compra
const crearCompra = async (req, res, next) => {
  try {
    const { id_cmp, id_cpr, fecha, lotes } = req.body;
    if (!lotes || !Array.isArray(lotes) || lotes.length === 0) {
      return res.status(400).json({ mensaje: "Debe incluir al menos un lote" });
    }

    const comprador = await Comprador.findById(id_cpr);
    if (!comprador) {
      return res.status(400).json({ mensaje: "Comprador no válido" });
    }

    const idsLotes = lotes.map(l => l.id_lte);
    const lotesBD = await Lote.find({ _id: { $in: idsLotes } });

    if (lotesBD.length !== idsLotes.length) {
      return res.status(400).json({ mensaje: "Uno o más lotes no existen" });
    }

    const loteVendido = lotesBD.find(l => l.vendido);
    if (loteVendido) {
      return res.status(400).json({ mensaje: `El lote ${loteVendido.id_lte} ya fue vendido` });
    }

    const lotesCalculados = lotesBD.map(l => {
      const kilos = Number(l.kilos || 0);
      const precio = Number(l.precio_kilo_salida || 0);
      const subtotal = kilos * precio;
      return {
        id_lte: l._id,
        kilos_comprados: kilos,
        precio_kilo_final: precio,
        subtotal
      };
    });

    const precio_total = lotesCalculados.reduce((acc, l) => acc + l.subtotal, 0);

    const compra = new Compra({
      id_cmp,
      id_cpr,
      fecha,
      lotes: lotesCalculados,
      precio_total
    });

    await compra.save();

    await Lote.updateMany(
      { _id: { $in: idsLotes } },
      { $set: { vendido: true } }
    );

    await registrarBitacora({
      tabla: "compra",
      accion: "CREAR",
      descripcion: `Se creó la compra ${id_cmp} para el comprador ${comprador.codigo_cpr}`
    });

    res.json({ mensaje: "Se creó la compra", compra });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const consultaCompra = async (req, res, next) => {
  try {
    const compras = await Compra.find({})
      .populate("id_cpr")
      .populate({
        path: "lotes.id_lte",
        populate: {
          path: "id_epe",
          populate: { path: "id_tpo" }
        }
      });
    res.json(compras);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const consultaCompraId = async (req, res, next) => {
  try {
    const compra = await Compra.findById(req.params.id)
      .populate("id_cpr")
      .populate({
        path: "lotes.id_lte",
        populate: {
          path: "id_epe",
          populate: { path: "id_tpo" }
        }
      });
    res.json(compra);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const actualizarCompra = async (req, res, next) => {
  try {
    const { id_cmp, id_cpr, fecha, lotes } = req.body;
    if (!lotes || !Array.isArray(lotes) || lotes.length === 0) {
      return res.status(400).json({ mensaje: "Debe incluir al menos un lote" });
    }

    const compraExistente = await Compra.findById(req.params.id);
    if (!compraExistente) {
      return res.status(404).json({ mensaje: "Compra no encontrada" });
    }

    const idsLotesPrevios = compraExistente.lotes.map(l => l.id_lte);
    await Lote.updateMany(
      { _id: { $in: idsLotesPrevios } },
      { $set: { vendido: false } }
    );

    const idsLotesNuevos = lotes.map(l => l.id_lte);
    const lotesBD = await Lote.find({ _id: { $in: idsLotesNuevos } });

    if (lotesBD.length !== idsLotesNuevos.length) {
      return res.status(400).json({ mensaje: "Uno o más lotes no existen" });
    }

    const loteVendido = lotesBD.find(l => l.vendido && !idsLotesPrevios.includes(l._id));
    if (loteVendido) {
      return res.status(400).json({ mensaje: `El lote ${loteVendido.id_lte} ya fue vendido` });
    }

    const lotesCalculados = lotesBD.map(l => {
      const kilos = Number(l.kilos || 0);
      const precio = Number(l.precio_kilo_salida || 0);
      const subtotal = kilos * precio;
      return {
        id_lte: l._id,
        kilos_comprados: kilos,
        precio_kilo_final: precio,
        subtotal
      };
    });

    const precio_total = lotesCalculados.reduce((acc, l) => acc + l.subtotal, 0);

    const compra = await Compra.findByIdAndUpdate(
      { _id: req.params.id },
      { id_cmp, id_cpr, fecha, lotes: lotesCalculados, precio_total },
      { new: true }
    );

    await Lote.updateMany(
      { _id: { $in: idsLotesNuevos } },
      { $set: { vendido: true } }
    );

    if (compra) {
      await registrarBitacora({
        tabla: "compra",
        accion: "ACTUALIZAR",
        descripcion: `Se actualizó la compra ${compra.id_cmp}`
      });
    }

    res.json(compra);
  } catch (error) {
    console.log(error);
    res.send(error);
    next(error);
  }
};

const eliminarCompra = async (req, res, next) => {
  try {
    const compra = await Compra.findByIdAndDelete(req.params.id);
    if (!compra) {
      return res.status(404).json({ mensaje: "Compra no encontrada" });
    }

    await registrarBitacora({
      tabla: "compra",
      accion: "ELIMINAR",
      descripcion: `Se eliminó la compra ${compra.id_cmp}`
    });

    res.json({ mensaje: "Compra eliminada" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ mensaje: "Error en servidor" });
    next(error);
  }
};

// comprador
const crearComprador = async (req, res, next) => {
  try {
    const comprador = new Comprador(req.body);
    await comprador.save();
    await registrarBitacora({
      tabla: "comprador",
      accion: "CREAR",
      descripcion: `Se creó el comprador ${comprador.codigo_cpr} - ${comprador.nombre}`
    });
    res.json({ mensaje: "Se creó el comprador" });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const consultaComprador = async (req, res, next) => {
  try {
    const compradores = await Comprador.find({});
    res.json(compradores);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const consultaCompradorId = async (req, res, next) => {
  try {
    const comprador = await Comprador.findById(req.params.id);
    res.json(comprador);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const actualizarComprador = async (req, res, next) => {
  try {
    const comprador = await Comprador.findByIdAndUpdate(
      { _id: req.params.id },
      req.body,
      { new: true }
    );
    if (comprador) {
      await registrarBitacora({
        tabla: "comprador",
        accion: "ACTUALIZAR",
        descripcion: `Se actualizó el comprador ${comprador.codigo_cpr}`
      });
    }
    res.json(comprador);
  } catch (error) {
    console.log(error);
    res.send(error);
    next(error);
  }
};

const eliminarComprador = async (req, res, next) => {
  try {
    const comprador = await Comprador.findByIdAndDelete(req.params.id);
    if (!comprador) {
      return res.status(404).json({ mensaje: "Comprador no encontrado" });
    }
    await registrarBitacora({
      tabla: "comprador",
      accion: "ELIMINAR",
      descripcion: `Se eliminó el comprador ${comprador.codigo_cpr}`
    });
    res.json({ mensaje: "Comprador eliminado" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ mensaje: "Error en servidor" });
    next(error);
  }
};

// tipo
const crearTipo = async (req, res, next) => {
  try {
    const tipo = new Tipo(req.body);
    await tipo.save();
    await registrarBitacora({
      tabla: "tipo",
      accion: "CREAR",
      descripcion: `Se creó el tipo ${tipo.id_tpo} - ${tipo.nombre}`
    });
    res.json({ mensaje: "Se creó el tipo" });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const consultaTipo = async (req, res, next) => {
  try {
    const tipos = await Tipo.find({});
    res.json(tipos);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const consultaTipoId = async (req, res, next) => {
  try {
    const tipo = await Tipo.findById(req.params.id);
    res.json(tipo);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const actualizarTipo = async (req, res, next) => {
  try {
    const tipo = await Tipo.findByIdAndUpdate(
      { _id: req.params.id },
      req.body,
      { new: true }
    );
    if (tipo) {
      await registrarBitacora({
        tabla: "tipo",
        accion: "ACTUALIZAR",
        descripcion: `Se actualizó el tipo ${tipo.id_tpo}`
      });
    }
    res.json(tipo);
  } catch (error) {
    console.log(error);
    res.send(error);
    next(error);
  }
};

const eliminarTipo = async (req, res, next) => {
  try {
    const tipo = await Tipo.findByIdAndDelete(req.params.id);
    if (!tipo) {
      return res.status(404).json({ mensaje: "Tipo no encontrado" });
    }
    await registrarBitacora({
      tabla: "tipo",
      accion: "ELIMINAR",
      descripcion: `Se eliminó el tipo ${tipo.id_tpo}`
    });
    res.json({ mensaje: "Tipo eliminado" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ mensaje: "Error en servidor" });
    next(error);
  }
};

// lote
const crearLote = async (req, res, next) => {
  try {
    const datos = req.body;
    const especie = await Especie.findById(datos.id_epe);
    if (!especie) {
      return res.status(400).json({ mensaje: "Especie no válida" });
    }
    const lote = new Lote(datos);
    await lote.save();
    await registrarBitacora({
      tabla: "lote",
      accion: "CREAR",
      descripcion: `Se creó el lote ${lote.id_lte} para especie ${especie.nombre}`
    });
    res.json({ mensaje: "Se creó el lote", lote });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const consultaLote = async (req, res, next) => {
  try {
    const lotes = await Lote.find({}).populate({
      path: "id_epe",
      populate: { path: "id_tpo" }
    });
    res.json(lotes);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const consultaLoteId = async (req, res, next) => {
  try {
    const lote = await Lote.findById(req.params.id).populate({
      path: "id_epe",
      populate: { path: "id_tpo" }
    });
    res.json(lote);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const actualizarLote = async (req, res, next) => {
  try {
    const datos = req.body;

    if (datos.id_epe) {
      const especie = await Especie.findById(datos.id_epe);
      if (!especie) {
        return res.status(400).json({ mensaje: "Especie no válida" });
      }
    }

    const lote = await Lote.findByIdAndUpdate(
      { _id: req.params.id },
      datos,
      { new: true }
    );
    if (lote) {
      await registrarBitacora({
        tabla: "lote",
        accion: "ACTUALIZAR",
        descripcion: `Se actualizó el lote ${lote.id_lte}`
      });
    }
    res.json(lote);
  } catch (error) {
    console.log(error);
    res.send(error);
    next(error);
  }
};

const eliminarLote = async (req, res, next) => {
  try {
    const lote = await Lote.findByIdAndDelete(req.params.id);
    if (!lote) {
      return res.status(404).json({ mensaje: "Lote no encontrado" });
    }
    await registrarBitacora({
      tabla: "lote",
      accion: "ELIMINAR",
      descripcion: `Se eliminó el lote ${lote.id_lte}`
    });
    res.json({ mensaje: "Lote eliminado" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ mensaje: "Error en servidor" });
    next(error);
  }
};

// especie
const crearEspecie = async (req, res, next) => {
  try {
    const especie = new Especie(req.body);
    await especie.save();
    await registrarBitacora({
      tabla: "especie",
      accion: "CREAR",
      descripcion: `Se creó la especie ${especie.id_epe} - ${especie.nombre}`
    });
    res.json({ mensaje: "Se creó la especie", especie });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const consultaEspecie = async (req, res, next) => {
  try {
    const soloActivas = req.query.soloActivas === "true";
    const filtro = soloActivas ? { vista: true } : {};
    const especies = await Especie.find(filtro).populate("id_tpo");
    res.json(especies);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const consultaEspecieId = async (req, res, next) => {
  try {
    const especie = await Especie.findById(req.params.id).populate("id_tpo");
    res.json(especie);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const actualizarEspecie = async (req, res, next) => {
  try {
    const especie = await Especie.findByIdAndUpdate(
      { _id: req.params.id },
      req.body,
      { new: true }
    );
    if (especie) {
      await registrarBitacora({
        tabla: "especie",
        accion: "ACTUALIZAR",
        descripcion: `Se actualizó la especie ${especie.id_epe}`
      });
    }
    res.json(especie);
  } catch (error) {
    console.log(error);
    res.send(error);
    next(error);
  }
};

const eliminarEspecie = async (req, res, next) => {
  try {
    const especie = await Especie.findByIdAndUpdate(
      { _id: req.params.id },
      { vista: false },
      { new: true }
    );
    if (especie) {
      await registrarBitacora({
        tabla: "especie",
        accion: "DESACTIVAR",
        descripcion: `Se ocultó la especie ${especie.id_epe}`
      });
    }
    res.json(especie);
  } catch (error) {
    console.log(error);
    res.send(error);
    next(error);
  }
};

const activarEspecie = async (req, res, next) => {
  try {
    const especie = await Especie.findByIdAndUpdate(
      { _id: req.params.id },
      { vista: true },
      { new: true }
    );
    if (especie) {
      await registrarBitacora({
        tabla: "especie",
        accion: "ACTIVAR",
        descripcion: `Se reactivó la especie ${especie.id_epe}`
      });
    }
    res.json(especie);
  } catch (error) {
    console.log(error);
    res.send(error);
    next(error);
  }
};

// bitácora
const consultaBitacoraDia = async (req, res, next) => {
  try {
    const { fecha } = req.query;
    let diaBase;
    if (fecha) {
      diaBase = new Date(`${fecha}T00:00:00`);
    } else {
      const ahora = new Date();
      diaBase = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
    }
    const inicio = new Date(diaBase.getFullYear(), diaBase.getMonth(), diaBase.getDate());
    const fin = new Date(diaBase.getFullYear(), diaBase.getMonth(), diaBase.getDate() + 1);

    const registros = await Bitacora.find({
      fecha: { $gte: inicio, $lt: fin }
    })
      .populate("usuario")
      .sort({ fecha: 1 });

    res.json(registros);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const consultaBitacoraRango = async (req, res, next) => {
  try {
    const { desde, hasta } = req.query;
    const inicio = desde ? new Date(`${desde}T00:00:00`) : new Date(2000, 0, 1);
    const fin = hasta ? new Date(`${hasta}T23:59:59`) : new Date(2100, 0, 1);

    const registros = await Bitacora.find({
      fecha: { $gte: inicio, $lte: fin }
    })
      .populate("usuario")
      .sort({ fecha: -1 });

    res.json(registros);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export {
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
  consultaBitacoraRango
};