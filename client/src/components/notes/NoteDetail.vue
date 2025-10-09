<template>
  <div v-if="note != null" class="container mt-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h1>{{ note.title || 'Sin título' }}</h1>
      <div class="d-flex gap-2">
        <button 
          v-if="isOwner"
          @click="toggleArchive" 
          class="btn" 
          :class="note.archived ? 'btn-success' : 'btn-warning'"
          :disabled="isLoading"
        >
          {{ note.archived ? 'Desarchivar' : 'Archivar' }}
        </button>
        <router-link
          v-if="isOwner"
          :to="{ name: 'editNote', params: { noteId: note.id } }"
          class="btn btn-outline-secondary"
        >
          Editar
        </router-link>
        <button
          v-if="isOwner"
          @click="deleteNote"
          class="btn btn-outline-danger"
          :disabled="isLoading"
        >
          Eliminar
        </button>
      </div>
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
import auth from "@/common/auth";
import { getStore } from "@/common/store";

export default {
  data() {
    return {
      note: null,
      isLoading: false
    };
  },
  computed: {
    isOwner() {
      if (!this.note) return false;
      const store = getStore();
      const currentUser = store.state.user.login;
      return this.note.owner === currentUser;
    }
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
        // Cambiar el estado de archived directamente
        this.note.archived = !this.note.archived;
        
        // Actualizar en el servidor
        await NoteRepository.update(this.note);
        
      } catch (error) {
        console.error('Error al archivar/desarchivar:', error);
        
        if (error.response?.status === 403) {
          alert('No tienes permisos para modificar esta nota. Solo el propietario puede archivar/desarchivar sus notas.');
        } else if (error.response?.status === 401) {
          alert('Sesión expirada. Por favor, inicia sesión de nuevo.');
          auth.logout();
          this.$router.push('/');
        } else if (error.response?.status === 404) {
          alert('Esta funcionalidad aún no está implementada en el servidor.');
        } else {
          alert('Error al actualizar la nota: ' + (error.response?.data?.message || error.message));
        }
      } finally {
        this.isLoading = false;
      }
    },
    async deleteNote() {
      // Mostrar mensaje de confirmación
      const confirmDelete = confirm(
        `¿Estás seguro de que quieres eliminar la nota "${this.note.title || 'Sin título'}"?\n\nEsta acción no se puede deshacer.`
      );
      
      if (!confirmDelete) {
        return;
      }
      
      this.isLoading = true;
      
      try {
        await NoteRepository.delete(this.note.id);
        
        // Mostrar mensaje de éxito
        alert('Nota eliminada correctamente');
        
        // Redirigir al listado de notas
        this.$router.push('/notes');
        
      } catch (error) {
        console.error('Error al eliminar nota:', error);
        
        if (error.response?.status === 403) {
          alert('No tienes permisos para eliminar esta nota. Solo el propietario puede eliminar sus notas.');
        } else if (error.response?.status === 401) {
          alert('Sesión expirada. Por favor, inicia sesión de nuevo.');
          auth.logout();
          this.$router.push('/');
        } else if (error.response?.status === 404) {
          alert('La nota no existe o ya fue eliminada.');
          this.$router.push('/notes');
        } else {
          alert('Error al eliminar la nota: ' + (error.response?.data?.message || error.message));
        }
      } finally {
        this.isLoading = false;
      }
    }
  }
};
</script>

<style scoped>
.gap-2 {
  gap: 0.5rem;
}
</style>
