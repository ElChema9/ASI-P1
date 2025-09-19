import HTTP from "@/common/http";

const resource = "notes";

function applyDate(note) {
  note.timestamp = new Date(note.timestamp);
  return note;
}

export default {
  async findAll() {
    const response = await HTTP.get(`${resource}`);
    response.data.forEach(applyDate);
    return response.data;
  },
  async findOne(id) {
    const response = await HTTP.get(`${resource}/${id}`);
    /*
     * La propiedad timestamp viene como texto plano, por ejemplo: "2025-09-18T18:04:27.632054"
     * La queremos convertir a "Date" porque así podemos usar los métodos para fechas de js.
     */
    response.data.timestamp = new Date(response.data.timestamp);
    return response.data;
  }
};
