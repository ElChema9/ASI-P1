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
    console.log('Filtrando por categoría ID:', categoryId);
    
    // Obtener todas las notas
    const allNotes = await this.findAll();
    console.log('Todas las notas:', allNotes);
    
    // Filtrar por categoría en el frontend
    const filteredNotes = allNotes.filter(note => {
      if (!note.categories || note.categories.length === 0) {
        return false;
      }
      
      // Verificar si la nota tiene la categoría buscada
      return note.categories.some(cat => cat.id == categoryId);
    });
    
    console.log('Notas filtradas para categoría', categoryId, ':', filteredNotes);
    return filteredNotes;
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
    const currentNote = await this.findOne(id);
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
    const currentNote = await this.findOne(id);
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
