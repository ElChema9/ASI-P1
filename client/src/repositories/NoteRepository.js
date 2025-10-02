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
    applyDate(response.data);
    return response.data;
  },
  async findByCategory(categoryId) {
    const response = await HTTP.get(`${resource}?category=${categoryId}`);
    response.data.forEach(applyDate);
    return response.data;
  },
  async create(note) {
    const response = await HTTP.post(resource, note);
    return response.data;
  },
  async update(note) {
    const response = await HTTP.put(`${resource}/${note.id}`, note);
    return response.data;
  },
  async archive(id) {
    // Obtener la nota actual
    const currentNote = await this.findOne(id);
    
    // Crear un objeto limpio solo con los campos necesarios
    const noteToUpdate = {
      id: currentNote.id,
      title: currentNote.title,
      content: currentNote.content,
      archived: true,
      categories: currentNote.categories
    };
    
    return await this.update(noteToUpdate);
  },
  async unarchive(id) {
    // Obtener la nota actual
    const currentNote = await this.findOne(id);
    
    // Crear un objeto limpio solo con los campos necesarios
    const noteToUpdate = {
      id: currentNote.id,
      title: currentNote.title,
      content: currentNote.content,
      archived: false,
      categories: currentNote.categories
    };
    
    return await this.update(noteToUpdate);
  }
};
