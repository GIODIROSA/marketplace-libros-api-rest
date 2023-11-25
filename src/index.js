require("dotenv").config();
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const app = express();
const bodyParser = require("body-parser");

//consultas_
const {
  obtenerLibros,
  agregarLibro,
  modificarPrecioLibro,
  eliminarLibro,
  registroUsuario,
  verificarCredenciales,
  getUsuario,
  crearLibroData,
} = require("./consulta");
const multer = require("multer");
const { Console } = require("console");

//PORT
const port = process.env.PORT || 3002;

//middleware
app.use(express.json({ limit: "50mb" }));
app.use(cors());
app.use("/uploads", express.static("uploads"));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));

//storage
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

app.post(
  "/subirImagen",
  uploadMiddleware.single("myFile"),
  async (req, res) => {
    try {
      const jsonDataString = req.body.data;

      const jsonData = JSON.parse(jsonDataString);

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

//usuarios

app.get("/usuarios", async (req, res) => {
  try {
    const token = req.headers.authorization;

    console.log("token=>", token);

    const readToken = token.split("Bearer ")[1];
    console.log("ESTE ES EL TOKEN:", readToken);

    jwt.verify(readToken, "az_AZ");
    const { email } = jwt.decode(readToken);
    const emailEncontrado = await getUsuario(email);

    if (emailEncontrado) {
      res.send(emailEncontrado[0]);
      res.status(200).json({ email: emailEncontrado });
    } else {
      res.status(404).json({ message: "Email no encontrado" });
    }
  } catch (error) {
    console.error("ERROR en la ruta /usuarios: ", error);
    res.status(error.code || 500).send(error);
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
    await verificarCredenciales(email, password);
    const token = jwt.sign({ email }, "az_AZ");
    // res.json({ success: true, email, token });
    res.send(token);
  } catch (error) {
    console.log(error);
    res.status(error || 500).send(error);
  }
});

//method
//check
app.get("/productos", async (req, res) => {
  const queryStrings = req.query;
  const libros = await obtenerLibros(queryStrings);
  res.json(libros);
});

app.post("/libros", async (req, res) => {
  try {
    const body = req.body;

    await agregarLibro(body);

    res.status(201).json({
      success: true,
      message: "Libro agregado con éxito",
    });
  } catch (error) {
    console.error("Error al agregar libro:", error);

    if (error instanceof Error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    } else {
      res.status(500).json({
        success: false,
        error: "Error interno del servidor",
      });
    }
  }
});

app.put("/libros/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { precio } = req.query;

    if (!precio || isNaN(Number(precio))) {
      return res
        .status(400)
        .json({ error: "El parámetro 'precio' es inválido" });
    }

    await modificarPrecioLibro(Number(precio), id);

    res
      .status(200)
      .json({ success: true, message: "Precio modificado con éxito" });
  } catch (error) {
    console.error("Error al modificar el precio del libro:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

app.delete("/libros/:id", async (req, res) => {
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

app.get("*", (req, res) => {
  res.status(404).send("Esta ruta no existe");
});

//servidor
app.listen(port, () => {
  console.log(`SERVIDOR ENCENDIDO EN EL PORT: ${port}`);
});
