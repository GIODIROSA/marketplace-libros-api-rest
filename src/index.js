require("dotenv").config();
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const app = express();
const bodyParser = require("body-parser");
const logger = require("morgan");
const { swaggerDocs } = require("./swagger/swagger");

//consultas_
const {
  obtenerLibros,
  modificarPrecioLibro,
  eliminarLibro,
  registroUsuario,
  verificarCredenciales,
  getUsuario,
  crearLibroData,
} = require("./consulta");

const { agregarPedidoDetalle } = require("./carritoCompras");

const multer = require("multer");
const { Console } = require("console");

/**
 *
 * PORT
 *
 */

const port = process.env.PORT || 3002;

/**
 *
 * MIDDLEWARE
 *
 */

app.use(express.json({ limit: "50mb" }));
app.use(cors());
app.use("/uploads", express.static("uploads"));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));
app.use(logger("dev"));
swaggerDocs(app, port);

/**
 *
 * STORAGE
 *
 */

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const filename = file.originalname;
    cb(null, filename);
  },
});

const uploadMiddleware = multer({ storage: storage });

/**
 * @openapi
 * /admin:
 *   post:
 *     tags:
 *       - Crear Libro
 *     summary: "Agregar un libro"
 *     description: "Agrega un libro con información proporcionada."
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               imagenProducto:
 *                 type: string
 *                 format: binary
 *               data:
 *                 type: string
 *             required:
 *               - imagenProducto
 *               - data
 *     responses:
 *       '200':
 *         description: "Libro agregado con éxito"
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Libro agregado con éxito"
 *       '500':
 *         description: "Error interno del servidor"
 *         content:
 *           application/json:
 *             example:
 *               error: "Error interno del servidor"
 */

app.post(
  "/admin",
  uploadMiddleware.single("imagenProducto"),
  async (req, res) => {
    try {
      const jsonDataString = req.body.data;

      const jsonData = JSON.parse(jsonDataString);

      console.log("JSON", jsonData);

      const originalFileName = req.file.originalname;

      const producto_imagen = `uploads\\${originalFileName}`;

      await crearLibroData(jsonData, producto_imagen);

      res.status(200).json({
        success: true,
        message: "Libro agregado con éxito",
      });
    } catch (error) {
      console.error("Error al agregar libro:", error);

      res.status(500).json({
        success: false,
        error:
          error instanceof Error ? error.message : "Error interno del servidor",
      });
    }
  }
);

/**
 * @openapi
 * /admin/{id}:
 *   delete:
 *     tags:
 *       - Delete libro
 *     summary: "Eliminar un libro"
 *     description: "Elimina un libro según su ID."
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: "Libro eliminado con éxito"
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Libro eliminado con éxito"
 *       '404':
 *         description: "Libro no encontrado"
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Libro no encontrado"
 *       '500':
 *         description: "Error interno del servidor"
 *         content:
 *           application/json:
 *             example:
 *               error: "Error interno del servidor"
 */

app.delete("/admin/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await eliminarLibro(id);

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Libro no encontrado" });
    }

    res
      .status(200)
      .json({ success: true, message: "Libro eliminado con éxito" });
  } catch (error) {
    console.error("Error al eliminar libro:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

/**
 * @openapi
 * /admin/{id}:
 *   put:
 *     tags:
 *       - Update libro
 *     summary: "Modificar el precio de un libro"
 *     description: "Modifica el precio de un libro según su ID."
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: producto_nombre
 *         schema:
 *           type: string
 *       - in: query
 *         name: producto_precio
 *         schema:
 *           type: number
 *     responses:
 *       '200':
 *         description: "Precio modificado con éxito"
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Precio modificado con éxito"
 *       '400':
 *         description: "Parámetro 'precio' inválido"
 *         content:
 *           application/json:
 *             example:
 *               error: "El parámetro 'precio' es inválido"
 *       '500':
 *         description: "Error interno del servidor"
 *         content:
 *           application/json:
 *             example:
 *               error: "Error interno del servidor"
 */

app.put("/admin/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { producto_nombre, producto_precio } = req.query;

    if (!producto_precio || isNaN(Number(producto_precio))) {
      return res
        .status(400)
        .json({ error: "El parámetro 'precio' es inválido" });
    }

    await modificarPrecioLibro(Number(producto_precio), producto_nombre, id);

    res
      .status(200)
      .json({ success: true, message: "Precio modificado con éxito" });
  } catch (error) {
    console.error("Error al modificar el precio del libro:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

/**
 *
 * USUARIOS
 *

 */

/**
 * @openapi
 * /usuarios:
 *   get:
 *     tags:
 *       - usuarios
 *     summary: "Obtener información del usuario"
 *     description: "Obtiene la información del usuario autenticado"
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       '200':
 *         description: "Información del usuario obtenida con éxito"
 *         content:
 *           application/json:
 *             example:
 *               usuario:
 *                 email: "vale@email.com"
 *                 nombre: "valentina"
 *       '401':
 *         description: "Sin autorización o token vacío"
 *         content:
 *           application/json:
 *             example:
 *               error: "Sin autorización o token vacío"
 */

app.get("/usuarios", async (req, res) => {
  const token = req.headers.authorization;
  try {
    if (!token || token === "Bearer null") {
      console.log("Sin autorización o token vacío");
      //  caso de ausencia de token
      res.status(401).json({ error: "Sin autorización o token vacío" });
    } else {
      console.log("token=>", token);

      const readToken = token.split("Bearer ")[1];
      console.log("ESTE ES EL TOKEN:", readToken);

      jwt.verify(readToken, "az_AZ");
      const { email } = jwt.decode(readToken);
      const emailEncontrado = await getUsuario(email);
      if (emailEncontrado) {
        res.send(emailEncontrado[0]);
      }
    }
  } catch (error) {
    console.error("ERROR en la ruta /usuarios: ", error);
    res
      .status(401)
      .json({ error: "Token inválido o error en la verificación" });
  }
});

app.post("/usuarios", async (req, res) => {
  try {
    const usuario = req.body;
    await registroUsuario(usuario);
    res.send("Usuario creado con éxito");
  } catch (error) {
    res.status(500).send(error);
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("->", email, password);

    if (!email || !password) {
      throw {
        code: 401,
        message: "",
      };
    }

    await verificarCredenciales(email, password);

    const token = jwt.sign({ email }, "az_AZ");

    return res.send(token);
  } catch (err) {
    res.status(err.code).json({ error: err.message });
  }
});

/**
 * @openapi
 * /productos:
 *   get:
 *     tags:
 *       - Read libros
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 */

app.get("/productos", async (req, res) => {
  const queryStrings = req.query;
  const libros = await obtenerLibros(queryStrings);
  res.json(libros);
});

/**
 *
 * CARRITO DE COMPRAS
 *
 */

app.post("/crear_pedido", async (req, res) => {
  try {
    const carritoData = req.body;
    console.log("data=>", carritoData);

    const calcularDetalleTotal = (detalle_pedido) => {
      return detalle_pedido.reduce(
        (accumulatedTotal, detalle) =>
          accumulatedTotal + detalle.detalle_cantidad * detalle.detalle_precio,
        0
      );
    };

    const total = calcularDetalleTotal(carritoData.detalle_pedido);

    console.log(">>>>>", total);

    const pedido = await agregarPedidoDetalle(carritoData, total);

    res.json(pedido);
  } catch (error) {
    console.error("Error al crear el pedido:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

app.get("*", (req, res) => {
  res.status(404).send("Esta ruta no existe");
});

/**
 *
 * SERVIDOR
 *
 */

app.listen(port, () => {
  console.log(`SERVIDOR ENCENDIDO EN EL PORT: ${port}`);
});

module.exports = app;