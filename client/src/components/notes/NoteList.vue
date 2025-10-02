<template>
  <div class="container">
    <h1 class="mb-3 text-center">Lista de notas</h1>
    <p class="text-muted text-center">Mostrando {{ filteredNotes.length }} notas</p>
    
    <div class="d-flex justify-content-center mb-4 gap-2">
      <router-link to="/notes/create" class="btn btn-success">
        Crear Nota
      </router-link>
      <button class="btn btn-outline-secondary" @click="toggleShowArchived">
        {{ showArchived ? 'Ocultar archivadas' : 'Mostrar archivadas' }}
      </button>
    </div>

    <div v-if="filteredNotes.length === 0" class="alert alert-info text-center">
      No tienes notas para mostrar.
    </div>
    
    <div v-else class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
      <div class="col" v-for="note in filteredNotes" :key="note.id">
        <NoteCard :note="note" @noteUpdated="refreshNotes" />
      </div>
    </div>
  </div>
</template>

<script>
import NoteRepository from "@/repositories/NoteRepository";
import NoteCard from "./NoteCard.vue";

export default {
  components: { NoteCard },
  data() {
    return {
      allNotes: [],
      showArchived: false
    };
  },
  computed: {
    filteredNotes() {
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
    }
  }
};
</script>

<style scoped>
.gap-2 {
  gap: 0.5rem;
}
</style>
