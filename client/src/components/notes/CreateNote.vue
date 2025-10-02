<template>
  <div class="container mt-4">
    <h2>Crear Nota</h2>
    <form @submit.prevent="crearNota">
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
          {{ isLoading ? 'Creando...' : 'Crear Nota' }}
        </button>
        <button type="button" class="btn btn-secondary" @click="cancelar">
          Cancelar
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import NoteRepository from "@/repositories/NoteRepository";
import CategoryRepository from "@/repositories/CategoryRepository";

export default {
  data() {
    return {
      note: {
        title: "",
        content: ""
      },
      categories: [],
      selectedCategoryIds: [],
      errorMessage: "",
      successMessage: "",
      isLoading: false
    };
  },
  async mounted() {
    try {
      this.categories = await CategoryRepository.findAll();
      console.log('Categorías cargadas:', this.categories);
    } catch (e) {
      console.error('Error al cargar categorías:', e);
      this.errorMessage = 'Error al cargar las categorías';
    }
  },
  methods: {
    async crearNota() {
      this.errorMessage = "";
      this.successMessage = "";

      // Validación: al menos título o contenido
      if (
        (!this.note.title || this.note.title.trim() === "") &&
        (!this.note.content || this.note.content.trim() === "")
      ) {
        this.errorMessage = "Debes indicar al menos título o contenido.";
        return;
      }

      // Validación: título máx 300
      if (this.note.title && this.note.title.length > 300) {
        this.errorMessage = "El título no puede superar los 300 caracteres.";
        return;
      }

      this.isLoading = true;

      // Construir las categorías como objetos con solo el ID
      const noteData = {
        title: this.note.title.trim() || null,
        content: this.note.content.trim() || null,
        categories: this.selectedCategoryIds.map(id => ({ id: id }))
      };

      console.log('Enviando nota:', noteData);

      try {
        const response = await NoteRepository.create(noteData);
        console.log('Nota creada:', response);
        this.successMessage = 'Nota creada correctamente. Redirigiendo...';
        
        setTimeout(() => {
          this.$router.push("/notes");
        }, 1500);
      } catch (e) {
        console.error('Error completo:', e);
        console.error('Response:', e.response);
        
        if (e.response?.status === 400) {
          this.errorMessage = e.response?.data?.message || 'Datos inválidos. Verifica los campos.';
        } else if (e.response?.status === 401) {
          this.errorMessage = 'No estás autenticado. Por favor inicia sesión.';
        } else {
          this.errorMessage = e.response?.data?.message || 'Error al crear la nota.';
        }
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