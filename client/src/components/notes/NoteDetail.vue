<template>
  <div v-if="note != null" class="container mt-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h1>{{ note.title || 'Sin título' }}</h1>
      <button 
        @click="toggleArchive" 
        class="btn" 
        :class="note.archived ? 'btn-success' : 'btn-warning'"
        :disabled="isLoading"
      >
        {{ note.archived ? 'Desarchivar' : 'Archivar' }}
      </button>
    </div>
    
    <div v-if="note.content" class="mb-3">
      <h5>Contenido</h5>
      <p>{{ note.content }}</p>
    </div>
    
    <div class="mb-3">
      <h5>Categorías</h5>
      <div v-if="note.categories && note.categories.length > 0">
        <span v-for="(category, index) in note.categories" :key="category.id">
          <router-link 
            :to="{ name: 'notesByCategory', params: { categoryId: category.id } }"
            class="text-decoration-none"
          >
            {{ category.name }}
          </router-link>
          <span v-if="index < note.categories.length - 1">, </span>
        </span>
      </div>
      <span v-else class="text-muted">Sin categorías</span>
    </div>
    
    <div class="mb-3">
      <h5>Fecha</h5>
      <span>{{ formatDate(note.timestamp) }}</span>
    </div>
    
    <router-link to="/notes" class="btn btn-secondary">
      ← Volver al listado
    </router-link>
  </div>
</template>

<script>
import NoteRepository from "@/repositories/NoteRepository";

export default {
  data() {
    return {
      note: null,
      isLoading: false
    };
  },
  async mounted() {
    this.note = await NoteRepository.findOne(this.$route.params.noteId);
  },
  methods: {
    formatDate(timestamp) {
      const date = new Date(timestamp);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${day}/${month}/${year}, a las ${hours}:${minutes}`;
    },
    async toggleArchive() {
      this.isLoading = true;
      
      try {
        if (this.note.archived) {
          await NoteRepository.unarchive(this.note.id);
          this.note.archived = false;
        } else {
          await NoteRepository.archive(this.note.id);
          this.note.archived = true;
        }
      } catch (error) {
        console.error('Error al archivar/desarchivar:', error);
        alert('Error al actualizar la nota');
      } finally {
        this.isLoading = false;
      }
    }
  }
};
</script>
