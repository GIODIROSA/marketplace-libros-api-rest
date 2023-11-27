const { pool } = require("./server");


const pedido = await agregarPedido();

  const detalle = await detallePedido();

module.exports = {
  pedido,
};
