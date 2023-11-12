const express = require("express");
const { Pool } = require("pg");

const pool = new Pool({
  host: "localhost",
  user: "postgres",
  password: "root",
  database: "marketplace_libros",
  allowExitOnIdle: true,
});

const obtenerLibros = async () => {
  try {
    const { rows } = await pool.query("SELECT * FROM productos");
    return rows;
  } catch (error) {
    console.error("Error en la query:", error);
    throw new Error("Error en obtener Libros");
  }
};



module.exports = {
  obtenerLibros,
};
