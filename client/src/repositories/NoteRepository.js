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
  }
};
