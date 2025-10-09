<template>
  <div class="card" style="width: 18rem">
    <div class="card-header d-flex justify-content-between align-items-center">
      <div class="d-flex flex-column">
        <router-link 
          v-if="isAdmin" 
          :to="{ name: 'userNotes', params: { login: note.owner }, query: { from: 'notes' } }"
          class="badge bg-primary mb-1 text-decoration-none user-link"
          :title="`Ver todas las notas de ${note.owner}`"
        >
          {{ note.owner }}
        </router-link>
        <span v-else>{{ note.owner }}</span>
        <span v-if="isAdmin" class="badge" :class="note.archived ? 'bg-secondary' : 'bg-success'">
          {{ note.archived ? 'Archivada' : 'Activa' }}
        </span>
      </div>
      <button 
        v-if="isOwner"
        @click="toggleArchive" 
        class="btn btn-sm" 
        :class="note.archived ? 'btn-success' : 'btn-warning'"
        :disabled="isLoading"
      >
        {{ note.archived ? 'Desarchivar' : 'Archivar' }}
      </button>
    </div>
    <div class="card-body">
      <h5 class="card-title">{{ note.title }}</h5>
      <h6 class="card-subtitle mb-2 text-muted">
        <router-link :to="{ name: 'noteDetail', params: { noteId: note.id } }">
          {{ formatDate(note.timestamp) }}
        </router-link>
      </h6>
      <p class="card-text">{{ note.content }}</p>
      <p>
        <router-link
        :to="{ name: 'editNote', params: { noteId: note.id } }"
        class="btn btn-outline-secondary btn-sm ms-2"
        v-if="isOwner"
      >
        Editar
      </router-link>
      <button
        v-if="isOwner"
        @click="deleteNote"
        class="btn btn-outline-danger btn-sm ms-2"
        :disabled="isLoading"
      >
        Eliminar
      </button>
      <router-link
        v-if="isAdmin"
        :to="{ name: 'changeNoteOwner', params: { id: note.id } }"
        class="btn btn-outline-primary btn-sm ms-2"
      >
        Cambiar creador
      </router-link>
      </p>
    </div>
    <div v-if="note.categories && note.categories.length > 0" class="card-footer">
      <span v-for="(category, index) in note.categories" :key="category.id">
        <router-link 
          :to="{ name: 'notesByCategory', params: { categoryId: category.id } }"
          class="text-decoration-none"
          @click="debugCategoryClick(category)"
        >
          {{ category.name }}
        </router-link>
        <span v-if="index < note.categories.length - 1">, </span>
      </span>
    </div>
  </div>
</template>

<script>
import NoteRepository from "@/repositories/NoteRepository";
import auth from "@/common/auth";
import { getStore } from "@/common/store";

export default {
  props: {
    note: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      isLoading: false
    };
  },
  computed: {
    isOwner() {
      const store = getStore();
      const currentUser = store.state.user.login;
      console.log('Usuario actual:', currentUser, 'Propietario nota:', this.note.owner);
      return this.note.owner === currentUser;
    },
    isAdmin() {
      return auth.isAdmin();
    }
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
    debugCategoryClick(category) {
      console.log('Clickeando en categoría:', category);
    },
    async toggleArchive() {
      this.isLoading = true;
      
      try {
         // Cambiar el estado de archived directamente
        this.note.archived = !this.note.archived;
        
        // Actualizar en el servidor
        await NoteRepository.update(this.note);
        
        this.$emit('noteUpdated');
      } catch (error) {
        console.error('Error al archivar/desarchivar:', error);
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
        
        // Emitir evento para que el componente padre actualice la lista
        this.$emit('noteDeleted', this.note.id);
        
        // Mostrar mensaje de éxito
        alert('Nota eliminada correctamente');
        
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
.user-link {
  cursor: pointer;
  transition: all 0.2s ease;
}

.user-link:hover {
  background-color: #0056b3 !important;
  transform: scale(1.05);
  text-decoration: none !important;
  color: white !important;
}
</style>
