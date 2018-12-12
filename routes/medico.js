var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Medico = require('../models/medico');

// ===============================
// Buscar todos los medicos
// ===============================
app.get('/', (req, res) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec((err, medicos) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: "Error al obtener los medicos",
                    errors: err
                });
            }

            Medico.count({}, (err, conteo) => {
                res.status(200).json({
                    ok: true,
                    medicos: medicos,
                    total: conteo
                });
            })
        });
});

// ===============================
// Actualizar medico
// ===============================
app.put("/:id", mdAutenticacion.verificarToken, (req, res) => {

  var id = req.params.id;
  var body = req.body;

  Medico.findById(id, (err, medico) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al buscar el medico",
        errors: err
      });
    }

    if (!medico) {
      return res.status(400).json({
        ok: false,
        mensaje: "El medico con el id: " + id + " no existe",
        errors: { message: "No existe un medico con ese ID" }
      });
    }

    medico.nombre = body.nombre;
    medico.usuario = req.usuario._id;
    medico.hospital = body.hospital;

    medico.save((err, medicoGuardado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: "Error al actualizar el medico",
          errors: err
        });
      }

      res.status(201).json({
        ok: true,
        medico: medicoGuardado
      });
    });
  });
});

// ===============================
// Agregar hospital
// ===============================
app.post("/", mdAutenticacion.verificarToken, (req, res) => {

  var body = req.body;

  var medico = new Medico({
    nombre: body.nombre,
    usuario: req.usuario._id,
    hospital: body.hospital
  });

  medico.save((err, medicoGuardado) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: "Error al crear el medico",
        errors: err
      });
    }

    res.status(201).json({
      ok: true,
      medico: medicoGuardado,
      usuarioToken: req.usuario
    });
  });
});

// ===============================
// Eliminar medico por ID
// ===============================
app.delete("/:id", mdAutenticacion.verificarToken, (req, res) => {
  var id = req.params.id;

  Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al borrar el medico",
        errors: err
      });
    }

    if (!medicoBorrado) {
      return res.status(400).json({
        ok: false,
        mensaje: "No existe ningun medico con ese ID",
        errors: { message: "No existe ningun medico con ese ID" }
      });
    }

    res.status(200).json({
      ok: true,
      medico: medicoBorrado
    });
  });
});

module.exports = app;