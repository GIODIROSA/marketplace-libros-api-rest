require("dotenv").config();
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const app = express();

//consultas_
const {
  obtenerLibros,
  agregarLibro,
  modificarPrecioLibro,
  eliminarLibro,
} = require("./consulta");

//PORT
const port = process.env.PORT || 3002;

//middleware
app.use(express.json());
app.use(cors());

//usuarios
app.post("/usuarios", async (req, res) => {
  try {
    const usuario = req.body;
    await registroUsuario(usuario);
    res.send("Usuario creado con éxito");
  } catch (error) {
    res.status(500).send(error);
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
