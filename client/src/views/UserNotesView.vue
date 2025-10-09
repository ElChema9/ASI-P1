<template>
  <div class="container mt-4">
    <div class="row">
      <div class="col-12">
        <!-- Header con información del usuario -->
        <div class="card mb-4">
          <div class="card-header bg-primary text-white">
            <div class="d-flex justify-content-between align-items-center">
              <h3 class="mb-0">
                <i class="fas fa-user me-2"></i>
                Notas de {{ userLogin }}
              </h3>
              <button @click="goBack" class="btn btn-light btn-sm">
                <i class="fas fa-arrow-left me-1"></i>
                Volver
              </button>
            </div>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-md-3">
                <strong>Usuario:</strong>
                <span class="badge bg-primary ms-2">{{ userLogin }}</span>
              </div>
              <div class="col-md-3">
                <strong>Total de notas:</strong>
                <span class="badge bg-info ms-2">{{ userNotes.length }}</span>
              </div>
              <div class="col-md-3">
                <strong>Notas activas:</strong>
                <span class="badge bg-success ms-2">{{ activeNotesCount }}</span>
              </div>
              <div class="col-md-3">
                <strong>Notas archivadas:</strong>
                <span class="badge bg-secondary ms-2">{{ archivedNotesCount }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Loading state -->
        <div v-if="loading" class="text-center">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
          <p class="mt-2 text-muted">Cargando notas de {{ userLogin }}...</p>
        </div>

        <!-- Error state -->
        <div v-else-if="error" class="alert alert-danger">
          <h5>Error al cargar las notas</h5>
          <p>{{ error }}</p>
          <button @click="loadUserNotes" class="btn btn-outline-danger">
            Reintentar
          </button>
        </div>

        <!-- Empty state -->
        <div v-else-if="userNotes.length === 0" class="alert alert-info text-center">
          <h5>Sin notas</h5>
          <p>El usuario <strong>{{ userLogin }}</strong> no tiene notas creadas.</p>
        </div>

        <!-- Notes grid -->
        <div v-else>
          <!-- Filter buttons -->
          <div class="d-flex justify-content-center mb-4 gap-2">
            <button 
              @click="filterType = 'all'" 
              class="btn" 
              :class="filterType === 'all' ? 'btn-primary' : 'btn-outline-primary'"
            >
              Todas ({{ userNotes.length }})
            </button>
            <button 
              @click="filterType = 'active'" 
              class="btn" 
              :class="filterType === 'active' ? 'btn-success' : 'btn-outline-success'"
            >
              Activas ({{ activeNotesCount }})
            </button>
            <button 
              @click="filterType = 'archived'" 
              class="btn" 
              :class="filterType === 'archived' ? 'btn-secondary' : 'btn-outline-secondary'"
            >
              Archivadas ({{ archivedNotesCount }})
            </button>
          </div>

          <!-- Notes cards -->
          <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            <div class="col" v-for="note in filteredNotes" :key="note.id">
              <NoteCard 
                :note="note" 
                @noteUpdated="loadUserNotes" 
                @noteDeleted="handleNoteDeleted"
                :show-owner="false"
              />
            </div>
          </div>

          <!-- Summary -->
          <div v-if="filteredNotes.length === 0 && filterType !== 'all'" class="alert alert-warning text-center mt-4">
            <h6>Sin notas {{ filterType === 'active' ? 'activas' : 'archivadas' }}</h6>
            <p>El usuario <strong>{{ userLogin }}</strong> no tiene notas {{ filterType === 'active' ? 'activas' : 'archivadas' }}.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import NoteRepository from "@/repositories/NoteRepository";
import NoteCard from "@/components/notes/NoteCard.vue";

export default {
  name: "UserNotesView",
  components: {
    NoteCard
  },
  data() {
    return {
      userLogin: "",
      userNotes: [],
      loading: true,
      error: null,
      filterType: 'all' // 'all', 'active', 'archived'
    };
  },
  computed: {
    activeNotesCount() {
      return this.userNotes.filter(note => !note.archived).length;
    },
    archivedNotesCount() {
      return this.userNotes.filter(note => note.archived).length;
    },
    filteredNotes() {
      switch (this.filterType) {
        case 'active':
          return this.userNotes.filter(note => !note.archived);
        case 'archived':
          return this.userNotes.filter(note => note.archived);
        default:
          return this.userNotes;
      }
    }
  },
  async mounted() {
    this.userLogin = this.$route.params.login;
    await this.loadUserNotes();
  },
  methods: {
    async loadUserNotes() {
      try {
        this.loading = true;
        this.error = null;
        
        // Obtener todas las notas y filtrar por el usuario específico
        const allNotes = await NoteRepository.findAll();
        this.userNotes = allNotes
          .filter(note => note.owner === this.userLogin)
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // Más recientes primero
        
      } catch (error) {
        console.error('Error al cargar notas del usuario:', error);
        this.error = `Error al cargar las notas del usuario ${this.userLogin}. Por favor, inténtelo de nuevo.`;
      } finally {
        this.loading = false;
      }
    },
    
    handleNoteDeleted(deletedNoteId) {
      // Eliminar la nota de la lista local sin necesidad de recargar
      this.userNotes = this.userNotes.filter(note => note.id !== deletedNoteId);
    },
    
    goBack() {
      // Si venimos del listado de usuarios, volver ahí; si no, al listado de notas
      const from = this.$route.query.from;
      if (from === 'users') {
        this.$router.push('/users');
      } else {
        this.$router.push('/notes');
      }
    }
  },
  
  // Watch para recargar si cambia el parámetro de usuario
  watch: {
    '$route.params.login': {
      handler(newLogin) {
        if (newLogin && newLogin !== this.userLogin) {
          this.userLogin = newLogin;
          this.loadUserNotes();
        }
      },
      immediate: false
    }
  }
};
</script>

<style scoped>
.gap-2 {
  gap: 0.5rem;
}

.card-header.bg-primary {
  background-color: #0d6efd !important;
}

.spinner-border {
  width: 2rem;
  height: 2rem;
}

.badge {
  font-size: 0.85em;
}

/* Hover effects for filter buttons */
.btn:hover {
  transform: translateY(-1px);
  transition: transform 0.2s ease;
}
</style>