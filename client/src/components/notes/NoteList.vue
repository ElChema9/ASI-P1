<template>
  <div class="container">
    <h1 class="mb-3 text-center">
      {{ isAdmin ? 'Lista de todas las notas (Administrador)' : 'Lista de notas' }}
    </h1>
    <p class="text-muted text-center">
      {{ isAdmin ? 'Mostrando todas las notas del sistema (activas y archivadas)' : 'Tus notas' }} - {{ filteredNotes.length }} notas
      <span v-if="isAdmin" class="d-block small">
        Cada nota incluye el login del usuario que la ha creado y su estado (Activa/Archivada)
      </span>
    </p>
    
    <div class="d-flex justify-content-center mb-4 gap-2">
      <router-link v-if="!isAdmin" to="/notes/create" class="btn btn-success">
        Crear Nota
      </router-link>
      <button v-if="!isAdmin" class="btn btn-outline-secondary" @click="toggleShowArchived">
        {{ showArchived ? 'Ocultar archivadas' : 'Mostrar archivadas' }}
      </button>
    </div>

    <div v-if="filteredNotes.length === 0" class="alert alert-info text-center">
      {{ isAdmin ? 'No hay notas en el sistema para mostrar.' : 'No tienes notas para mostrar.' }}
    </div>
    
    <div v-else class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
      <div class="col" v-for="note in filteredNotes" :key="note.id">
        <NoteCard :note="note" @noteUpdated="refreshNotes" @noteDeleted="handleNoteDeleted" />
      </div>
    </div>
  </div>
</template>

<script>
import NoteRepository from "@/repositories/NoteRepository";
import NoteCard from "./NoteCard.vue";
import auth from "@/common/auth";

export default {
  components: { NoteCard },
  data() {
    return {
      allNotes: [],
      showArchived: false
    };
  },
  computed: {
    isAdmin() {
      return auth.isAdmin();
    },
    filteredNotes() {
      // Si es admin, siempre mostrar todas las notas
      if (this.isAdmin) {
        return this.allNotes;
      }
      // Si no es admin, usar la lógica del toggle
      if (this.showArchived) {
        return this.allNotes; // Mostrar todas las notas que tengamos
      }
      return this.allNotes.filter(note => !note.archived); // Solo activas
    }
  },
  async mounted() {
    await this.loadNotes();
  },
  methods: {
    async loadNotes() {
      try {
        // Usar el método normal que ya funcionaba
        this.allNotes = await NoteRepository.findAll();
        console.log('Notas cargadas:', this.allNotes);
      } catch (error) {
        console.error('Error al cargar notas:', error);
        this.allNotes = [];
      }
    },
    toggleShowArchived() {
      this.showArchived = !this.showArchived;
    },
    async refreshNotes() {
      await this.loadNotes();
    },
    handleNoteDeleted(deletedNoteId) {
      // Eliminar la nota de la lista local sin necesidad de recargar
      this.allNotes = this.allNotes.filter(note => note.id !== deletedNoteId);
    }
  }
};
</script>

<style scoped>
.gap-2 {
  gap: 0.5rem;
}
</style>
