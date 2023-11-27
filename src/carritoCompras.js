const { pool } = require("./server");

const agregarPedidoDetalle = async (carritoData, detalle_total) => {
  try {
    const pedido_total = detalle_total;


    const insertPedidoQuery = `
          INSERT INTO pedido (
            pedido_fecha,
            pedido_total,
            usuario_id,
            pedido_estado
          ) VALUES (
            $1, $2, $3, $4
          ) RETURNING pedido_id;
        `;

    const pedidoValues = [
      carritoData.pedido_fecha,
      pedido_total,
      carritoData.usuario_id,
      carritoData.pedido_estado,
    ];

    const pedidoResult = await pool.query(insertPedidoQuery, pedidoValues);
    const pedidoId = pedidoResult.rows[0].pedido_id;


    for (const detalle of carritoData.detalle_pedido) {
      const insertDetalleQuery = `
          INSERT INTO detalle_pedido (
            detalle_cantidad,
            detalle_total,
            detalle_precio,
            producto_id,
            pedido_id
          ) VALUES (
            $1, $2, $3, $4, $5
          );
        `;

      const detalleValues = [
        detalle.detalle_cantidad,
        detalle_total,
        detalle.detalle_precio,
        detalle.producto_id,
        pedidoId,
      ];

      await pool.query(insertDetalleQuery, detalleValues);
    }

    return {
      mensaje: "Pedido realizado exitosamente",
      detalle_total: detalle_total,
    };
  } catch (error) {
    console.error("Error al crear el pedido:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};



module.exports = {
  agregarPedidoDetalle,
};
