<template>
  <div class="container mt-4">
    <h2>Editar Nota</h2>
    <form v-if="note" @submit.prevent="editarNota">
      <div class="mb-3">
        <label for="title" class="form-label">Título (opcional, máx 300):</label>
        <input
          type="text"
          id="title"
          v-model="note.title"
          maxlength="300"
          class="form-control"
          placeholder="Título de la nota"
        />
        <small class="text-muted">{{ note.title.length }}/300 caracteres</small>
      </div>
      <div class="mb-3">
        <label for="content" class="form-label">Contenido (opcional):</label>
        <textarea
          id="content"
          v-model="note.content"
          class="form-control"
          rows="5"
          placeholder="Contenido de la nota"
        ></textarea>
      </div>
      <div class="mb-3">
        <label class="form-label">Categorías (puedes seleccionar varias):</label>
        <div v-if="categories.length === 0" class="text-muted">
          No hay categorías disponibles
        </div>
        <div v-else>
          <div v-for="cat in categories" :key="cat.id" class="form-check form-check-inline">
            <input
              class="form-check-input"
              type="checkbox"
              :id="'cat-' + cat.id"
              :value="cat.id"
              v-model="selectedCategoryIds"
            />
            <label class="form-check-label" :for="'cat-' + cat.id">{{ cat.name }}</label>
          </div>
        </div>
      </div>
      <div v-if="errorMessage" class="alert alert-danger">
        {{ errorMessage }}
      </div>
      <div v-if="successMessage" class="alert alert-success">
        {{ successMessage }}
      </div>
      <div class="d-flex gap-2">
        <button type="submit" class="btn btn-primary" :disabled="isLoading">
          {{ isLoading ? 'Guardando...' : 'Guardar cambios' }}
        </button>
        <button type="button" class="btn btn-secondary" @click="cancelar">
          Cancelar
        </button>
      </div>
    </form>
    <div v-else class="alert alert-info">
      Cargando datos de la nota...
    </div>
  </div>
</template>

<script>
import NoteRepository from "@/repositories/NoteRepository";
import CategoryRepository from "@/repositories/CategoryRepository";

export default {
  data() {
    return {
      note: null,
      categories: [],
      selectedCategoryIds: [],
      errorMessage: "",
      successMessage: "",
      isLoading: false
    };
  },
  async mounted() {
    const noteId = this.$route.params.noteId;
    try {
      this.note = await NoteRepository.findOne(noteId);
      this.categories = await CategoryRepository.findAll();
      // Inicializar categorías seleccionadas
      this.selectedCategoryIds = this.note.categories ? this.note.categories.map(cat => cat.id) : [];
    } catch (e) {
      this.errorMessage = "Error al cargar los datos de la nota.";
    }
  },
  methods: {
    async editarNota() {
      this.errorMessage = "";
      this.successMessage = "";

      // Validación
        const safeTitle = (this.note.title || '').trim();
        const safeContent = (this.note.content || '').trim();
        if (safeTitle === "" && safeContent === "") {
          this.errorMessage = "Debes indicar al menos título o contenido.";
          return;
        }
        if (safeTitle.length > 300) {
          this.errorMessage = "El título no puede superar los 300 caracteres.";
          return;
        }

        this.isLoading = true;

        // Construir objeto para enviar
        const noteData = {
          id: this.note.id,
          title: safeTitle || null,
          content: safeContent || null,
          archived: this.note.archived,
          categories: this.selectedCategoryIds.map(id => ({ id: id }))
        };

      try {
        await NoteRepository.update(noteData);
        this.successMessage = "Nota actualizada correctamente.";
        setTimeout(() => {
          this.$router.push("/notes");
        }, 1200);
      } catch (e) {
        this.errorMessage = e.response?.data?.message || "Error al actualizar la nota.";
      } finally {
        this.isLoading = false;
      }
    },
    cancelar() {
      this.$router.push("/notes");
    }
  }
};
</script>

<style scoped>
.container {
  max-width: 800px;
}
.gap-2 {
  gap: 10px;
}
</style>