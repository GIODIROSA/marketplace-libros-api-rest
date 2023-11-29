const { pool } = require("./server");
const bcrypt = require("bcryptjs");


/**
 * 
 * CONSULTA BASADAS EN USUARIOS
 * 
 */

const getUsuario = async (email) => {
  try {
    let consulta = "SELECT * FROM usuarios WHERE email = $1";
    let values = [email];
    const { rows } = await pool.query(consulta, values);

    return rows;
  } catch (error) {
    console.error("ERROR en la query: ", error);
    throw error;
  }
};

const verificarCredenciales = async (email, password) => {

  console.log("verificar:", email, password);


  const consulta = "SELECT * FROM usuarios WHERE email = $1";
  const { rows, rowCount } = await pool.query(consulta, [email]);


  if (rowCount === 0) {
    throw {
      code: 404,
      message: "No se encontró ningún usuario con estas credenciales",
    };
  }

  const usuario = rows[0];
  const passwordEncriptado = usuario.password;

  if (!bcrypt.compareSync(password, passwordEncriptado)) {
    throw {
      code: 401,
      message: "Contraseña incorrecta",
    };
  }
};



const registroUsuario = async (usuario) => {
  try {
    let { nombre, apellido, direccion, email, password } = usuario;

    let rol = "usuario";

    const passwordEncriptado = bcrypt.hashSync(password);
    password = passwordEncriptado;

    const values = [
      nombre,
      apellido,
      direccion,
      email,
      passwordEncriptado,
      rol,
    ];

    const consulta =
      "INSERT INTO usuarios (nombre, apellido, direccion, email, password, rol) VALUES ($1, $2, $3, $4, $5, $6)";

    const { rowCount } = await pool.query(consulta, values);
    return rowCount;
  } catch (error) {
    console.error("ERROR en la query: ", error);
    res.status(500).json({ error: "Error al actualizar el evento" });
  }
};

/**
 *  CONSULTA BASADAS EN LIBROS - PRODUCTOS
 * 
 */
const obtenerLibros = async ({ limits = 10, order_by = "producto_id_ASC" }) => {
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

const modificarPrecioLibro = async (producto_precio, producto_nombre, id) => {
  try {
    const consulta =
      "UPDATE productos SET producto_precio = $1, producto_nombre = $2 WHERE producto_id = $3";
    const values = [producto_precio, producto_nombre, id];
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

const crearLibroData = async (jsonData, producto_imagen) => {
  try {
    const {
      producto_nombre,
      producto_descripcion,
      producto_precio,
      producto_categoria,
      producto_autores,
      producto_stock,
      producto_estado,
    } = jsonData;

    const insertProductoQuery = `
      INSERT INTO productos (
        producto_nombre,
        producto_imagen,
        producto_descripcion,
        producto_precio,
        producto_categoria,
        producto_autores,
        producto_stock,
        producto_estado
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8
      ) RETURNING *;
    `;

    const values = [
      producto_nombre,
      producto_imagen,
      producto_descripcion,
      producto_precio,
      producto_categoria,
      producto_autores,
      producto_stock,
      producto_estado,
    ];

    const result = await pool.query(insertProductoQuery, values);

    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

module.exports = {
  obtenerLibros,
  modificarPrecioLibro,
  eliminarLibro,
  registroUsuario,
  verificarCredenciales,
  getUsuario,
  crearLibroData,
};
