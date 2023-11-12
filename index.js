const express = require("express");
const cors = require("cors");
const app = express();

const { Pool } = require("pg");

const pool = new Pool({
  host: "localhost",
  user: "postgres",
  password: "root",
  database: "marketplace_libros",
  allowExitOnIdle: true,
});

//consultas_
const { obtenerLibros } = require("./consulta");

//PORT
const PORT = 3001;

//servicios
app.use(express.json());
app.use(cors());

//method
app.get("/libros", async (req, res) => {
  const libros = await obtenerLibros();
  res.json(libros);
});

//servidor
app.listen(PORT, () => {
  console.log(`SERVIDOR ENCENDIDO EN EL PORT: ${PORT}`);
});



// const getDate = async()=> {
//     const result = await pool.query("SELECT NOW()")
//     console.log(result)
// }

// getDate();
