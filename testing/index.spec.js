const request = require("supertest");
const server = require("../src/index");

describe("test Productos", () => {
  it("debería obtener la lista de productos", async () => {
    const response = await request(server).get("/productos");

    expect(response.status).toBe(200);

    expect(response.type).toBe("application/json");
  });

  it("Debería eliminar el libro con éxito", async () => {
    const response = await request(server).delete("/admin/34");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      message: "Libro eliminado con éxito",
    });
  });

  it("modificar libro / nombre y precio", async () => {
    const idLibro = 5;
    const tituloLibro = "loquesea";
    const precioLibro = 30000;
  
    const updateData = {
      id: idLibro,
      producto_nombre: tituloLibro,
      producto_precio: precioLibro,
    };
  
    const response = await request(server)
      .put(`/admin/${idLibro}?producto_nombre=${tituloLibro}&producto_precio=${precioLibro}`)
      .send(updateData);
  
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      message: "Precio modificado con éxito",
    });
  });
  
});
