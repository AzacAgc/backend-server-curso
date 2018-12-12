var express = require("express");
var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

// Default options
app.use( fileUpload() );

app.put("/:tipo/:id", (req, res, next) => {

  var tipo = req.params.tipo;
  var id = req.params.id;

  // Tipos de colecciones
  var tiposValidos = ['hospitales', 'medicos', 'usuarios'];

  if ( tiposValidos.indexOf( tipo ) < 0 ) {
    return res.status(400).json({
        ok: false,
        mensaje: "Tipo de colección no válida",
        errors: { message: "Tipo de colección no válida" }
      });
  }

  if ( !req.files ) {
    return res.status(400).json({
      ok: false,
      mensaje: "No selecciono ningun archivo",
      errors: { message: 'Debe seleccionar una imagen' }
    });
  }

  // Obtener el nombre del archivo
  var archivo = req.files.imagen;
  var nombreCortado = archivo.name.split('.');
  var extensionArchivo = nombreCortado[ nombreCortado.length - 1 ];

  // Sólo se aceptan ciertas extensiones
  var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

  if ( extensionesValidas.indexOf( extensionArchivo ) < 0 ) {
    return res.status(400).json({
      ok: false,
      mensaje: "La extensión del archivo no es valida",
      errors: { message: 'Las extensiones válidas son: ' + extensionesValidas.join(', ') }
    });
  }

  // Nombre de archivo personalizado
  var nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extensionArchivo }`;

  // Mover el archivo a un temporal a un path
  var path = `./uploads/${ tipo }/${ nombreArchivo }`;

  archivo.mv(path, err => {

      if ( err ) {
        return res.status(500).json({
          ok: false,
          mensaje: "Error al mover el archivo",
          errors: err
        });
      }

      subirPorTipo(tipo, id, nombreArchivo, res);
  });
});


function subirPorTipo(tipo, id, nombreArchivo, res) {
  if ( tipo === 'usuarios' ) {
    Usuario.findById( id, (err, usuario) => {

      if ( !usuario ) {
        res.status(400).json({
          ok: false,
          mensaje: "El usuario no existe",
          errors: { message: "El usuario no existe" }
        });
      }

      var pathViejo = './uploads/usuarios/' + usuario.img;

      // Si existe elimina la imagen anterior
      if ( fs.existsSync( pathViejo ) ) {
        fs.unlink( pathViejo );
      }

      usuario.img = nombreArchivo;

      return usuario.save( (err, usuarioActualizado) => {

        usuarioActualizado.password = '^.^';

        res.status(200).json({
          ok: true,
          mensaje: "Imagen de usuario actualizada",
          usuario: usuarioActualizado
        });
      });
    });
  }// end if - Usuarios

  if ( tipo === 'medicos' ) {
    Medico.findById(id, (err, medico) => {

      if ( !medico ) {
        res.status(400).json({
            ok: false,
            mensaje: "El médico no existe",
            errors: { message: "El médico no existe" }
          });
      }

      var pathViejo = './uploads/medicos/' + medico.img;

      // Si existe elimina la imagen anterior
      if (fs.existsSync(pathViejo)) {
        fs.unlink(pathViejo);
      }

      medico.img = nombreArchivo;

      return medico.save((err, medicoActualizado) => {
        res.status(200).json({
          ok: true,
          mensaje: "Imagen de medico actualizada",
          medico: medicoActualizado
        });
      });
    });
  }// end if - Medicos

  if ( tipo === 'hospitales' ) {
    Hospital.findById(id, (err, hospital) => {

      if ( !hospital ) {
        res.status(400).json({
          ok: false,
          mensaje: "El hospital no existe",
          errors: { message: "El hospital no existe" }
        });
      }

      var pathViejo = "./uploads/hospitales/" + hospital.img;

      // Si existe elimina la imagen anterior
      if (fs.existsSync(pathViejo)) {
        fs.unlink(pathViejo);
      }

      hospital.img = nombreArchivo;

      return hospital.save((err, hospitalActualizado) => {
        res.status(200).json({
            ok: true,
            mensaje: "Imagen de hospital actualizada",
            hospital: hospitalActualizado
          });
      });
    });
  }// end if - Hospitales
}

module.exports = app;
