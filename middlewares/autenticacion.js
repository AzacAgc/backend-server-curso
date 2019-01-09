var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;

// ===============================
// Verificar token
// ===============================
exports.verificarToken = function(req, res, next) {

    var token = req.query.token;

    jwt.verify(token, SEED, (err, decoded) => {

        if (err) {
            return res.status(401).json({
                ok: false,
                mensaje: "Token incorrecto",
                errors: err
            });
        }

        req.usuario = decoded.usuario;

        next();

    });

}// end of verificarToken

// ===============================
// Verificar Admin
// ===============================
exports.verificarADMIN_ROLE = function (req, res, next) {
    var usuario = req.usuario;

    if ( usuario.role === 'ADMIN_ROLE' ) {
        next();
        return;
    } else {
        return res.status(401).json({
            ok: false,
            mensaje: "Token incorrecto",
            errors: { message: 'No es administrador, acción no permitida' }
        });
    }
}// end of verificarToken

// ===============================
// Verificar Admin o Usuario
// ===============================
exports.verificarADMIN_ROLE_o_USUARIO = function (req, res, next) {
    var usuario = req.usuario;
    var id = req.params.id;

    if ( usuario.role === 'ADMIN_ROLE' || usuario._id === id ) {
        next();
        return;
    } else {
        return res.status(401).json({
            ok: false,
            mensaje: "Token incorrecto",
            errors: { message: 'No es administrador o el mismo usuario, acción no permitida.' }
        });
    }
}// end of verificarToken
