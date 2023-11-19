const { pool } = require("./server");

const obtenerLibros = async ({
  limits = 10,
  order_by = "producto_id_ASC",
}) => {
  let nombreQuery;
  let direccion;

  try {
    const consulta = order_by.replace(/_([^_]*)$/, "$1");

    if (consulta === "producto_idASC") {
      const matches = consulta.match(/^(.*?)(ASC)?$/);

      const nombreCompleto = matches[1];
      nombreQuery = nombreCompleto.replace(/ASC$/, "");

      direccion = matches[2] ? "ASC" : "DESC";
    } else {
      const matches = consulta.match(/^(.*?)(DESC)?$/);

      const nombreCompleto = matches[1];
      nombreQuery = nombreCompleto.replace(/DESC$/, "");

      direccion = matches[2] ? "DESC" : "ASC";
    }

    console.log("> nombre:", nombreQuery);
    console.log("> orden:", direccion);
    

    const formattedQuery = {
      text: `SELECT * FROM productos ORDER BY ${nombreQuery} ${direccion} LIMIT $1`,
      values: [limits],
    };

    const { rows: productos } = await pool.query(formattedQuery);
    return productos;
  } catch (error) {
    console.error("Error en la query:", error);
    throw new Error("Error en obtener Libros");
  }
};

const agregarLibro = async (body) => {
  const {
    producto_nombre,
    producto_imagen,
    producto_descripcion,
    producto_precio_unitario,
    producto_autores,
    producto_stock,
    categoria_id,
  } = body;

  try {
    const consulta =
      "INSERT INTO productos (producto_nombre, producto_imagen, producto_descripcion, producto_precio_unitario, producto_autores, producto_stock, categoria_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *";

    const values = [
      producto_nombre,
      producto_imagen,
      producto_descripcion,
      producto_precio_unitario,
      producto_autores,
      producto_stock,
      categoria_id,
    ];

    const result = await pool.query(consulta, values);
    console.log("Libro agregado:", result.rows[0]);
  } catch (error) {
    console.error("Error en la query:", error);
    throw new Error("Error al agregar el libro");
  }
};

const modificarPrecioLibro = async (precio, id) => {
  try {
    const consulta =
      "UPDATE productos SET producto_precio_unitario = $1 WHERE producto_id = $2";
    const values = [precio, id];
    const result = await pool.query(consulta, values);

    if (result.rowCount === 0) {
      throw new Error(`No se encontró ningún libro con el ID ${id}`);
    }

    console.log(`Precio del libro con ID ${id} modificado con éxito`);
  } catch (error) {
    console.error("Error al modificar el precio del libro:", error);
    throw error;
  }
};

const eliminarLibro = async (id) => {
  const consulta = "DELETE FROM productos WHERE producto_id = $1 RETURNING *";
  const values = [id];
  const result = await pool.query(consulta, values);

  if (result.rowCount === 0) {
    throw new Error("No se encontró ningún libro con ese ID");
  }

  return result.rows[0];
};

module.exports = {
  obtenerLibros,
  agregarLibro,
  modificarPrecioLibro,
  eliminarLibro,
};
