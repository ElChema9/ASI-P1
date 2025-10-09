<template>
  <div class="card" style="width: 18rem">
    <div class="card-header d-flex justify-content-between align-items-center">
      <span>{{ note.owner }}</span>
      <button 
        v-if="isOwner"
        @click="toggleArchive" 
        class="btn btn-sm" 
        :class="note.archived ? 'btn-success' : 'btn-warning'"
        :disabled="isLoading"
      >
        {{ note.archived ? 'Desarchivar' : 'Archivar' }}
      </button>
      <small v-else class="text-muted">No archivable</small>
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
        if (this.note.archived) {
          await NoteRepository.unarchive(this.note.id);
          this.note.archived = false;
        } else {
          await NoteRepository.archive(this.note.id);
          this.note.archived = true;
        }
        
        this.$emit('noteUpdated');
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
    }
  }
};
</script>
