<template>
  <div class="container mt-4">
    <div class="row justify-content-center">
      <div class="col-md-8">
        <div class="card">
          <div class="card-header">
            <h3 class="mb-0">Cambiar creador de nota</h3>
          </div>
          <div class="card-body">
            
            <div v-if="loading" class="text-center">
              <div class="spinner-border" role="status">
                <span class="visually-hidden">Cargando...</span>
              </div>
              <p class="mt-2">Cargando datos...</p>
            </div>

            <div v-else-if="note">
              <!-- Información de la nota (solo lectura) -->
              <div class="row mb-4">
                <div class="col-12">
                  <h5 class="text-muted mb-3">Información de la nota</h5>
                </div>
              </div>

              <div class="row mb-3">
                <div class="col-md-6">
                  <label class="form-label"><strong>Título:</strong></label>
                  <p class="form-control-plaintext border rounded p-2 bg-light">{{ note.title }}</p>
                </div>
                <div class="col-md-6">
                  <label class="form-label"><strong>Fecha de creación:</strong></label>
                  <p class="form-control-plaintext border rounded p-2 bg-light">{{ formatDate(note.timestamp) }}</p>
                </div>
              </div>

              <div class="row mb-3">
                <div class="col-12">
                  <label class="form-label"><strong>Contenido:</strong></label>
                  <div class="form-control-plaintext border rounded p-2 bg-light" style="min-height: 100px; white-space: pre-wrap;">{{ note.content }}</div>
                </div>
              </div>

              <div class="row mb-3">
                <div class="col-md-6">
                  <label class="form-label"><strong>Estado:</strong></label>
                  <p class="form-control-plaintext border rounded p-2 bg-light">
                    <span class="badge" :class="note.archived ? 'bg-secondary' : 'bg-success'">
                      {{ note.archived ? 'Archivada' : 'Activa' }}
                    </span>
                  </p>
                </div>
                <div class="col-md-6">
                  <label class="form-label"><strong>Categorías:</strong></label>
                  <div class="form-control-plaintext border rounded p-2 bg-light">
                    <span v-if="note.categories && note.categories.length > 0">
                      <span v-for="category in note.categories" :key="category.id" class="badge bg-info me-1">
                        {{ category.name }}
                      </span>
                    </span>
                    <span v-else class="text-muted">Sin categorías</span>
                  </div>
                </div>
              </div>

              <hr class="my-4">

              <!-- Selector de nuevo propietario -->
              <div class="row mb-4">
                <div class="col-12">
                  <h5 class="text-muted mb-3">Cambiar propietario</h5>
                </div>
              </div>

              <div class="row mb-3">
                <div class="col-md-6">
                  <label class="form-label"><strong>Propietario actual:</strong></label>
                  <p class="form-control-plaintext border rounded p-2 bg-warning bg-opacity-25">
                    <span class="badge bg-primary">{{ originalOwner }}</span>
                  </p>
                </div>
                <div class="col-md-6">
                  <label for="newOwner" class="form-label"><strong>Nuevo propietario:</strong></label>
                  <select 
                    id="newOwner" 
                    v-model="selectedUserId" 
                    class="form-select"
                    :class="{ 'border-success': hasChanges }"
                  >
                    <option value="">Seleccionar usuario...</option>
                    <option 
                      v-for="user in availableUsers" 
                      :key="user.id" 
                      :value="user.id"
                      :disabled="user.login === originalOwner"
                    >
                      {{ user.login }}{{ user.login === originalOwner ? ' (actual)' : '' }}
                    </option>
                  </select>
                </div>
              </div>

              <!-- Botones de acción -->
              <div class="row">
                <div class="col-12">
                  <hr class="mb-3">
                  <div class="d-flex justify-content-end gap-2">
                    <button 
                      type="button" 
                      class="btn btn-secondary" 
                      @click="cancel"
                      :disabled="saving"
                    >
                      Cancelar
                    </button>
                    <button 
                      type="button" 
                      class="btn btn-success" 
                      @click="saveChanges"
                      :disabled="!hasChanges || saving || !selectedUserId"
                    >
                      <span v-if="saving" class="spinner-border spinner-border-sm me-2" role="status"></span>
                      {{ saving ? 'Guardando...' : 'Guardar cambios' }}
                    </button>
                  </div>
                </div>
              </div>

            </div>

            <div v-else class="alert alert-danger">
              Error al cargar la nota. Verifique que la nota existe y que tiene permisos para modificarla.
            </div>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import NoteRepository from "@/repositories/NoteRepository";
import UserRepository from "@/repositories/UserRepository";

export default {
  name: "ChangeNoteOwnerView",
  data() {
    return {
      note: null,
      originalOwner: "",
      availableUsers: [],
      selectedUserId: "",
      loading: true,
      saving: false
    };
  },
  computed: {
    hasChanges() {
      if (!this.selectedUserId || !this.note) return false;
      const selectedUser = this.availableUsers.find(u => u.id == this.selectedUserId);
      return selectedUser && selectedUser.login !== this.originalOwner;
    }
  },
  async mounted() {
    await this.loadData();
  },
  methods: {
    async loadData() {
      try {
        this.loading = true;
        const noteId = this.$route.params.id;
        
        // Cargar la nota
        this.note = await NoteRepository.findOne(noteId);
        this.originalOwner = this.note.owner;
        
        // Cargar todos los usuarios
        this.availableUsers = await UserRepository.findAll();
        
        // Pre-seleccionar el usuario actual
        const currentUser = this.availableUsers.find(u => u.login === this.originalOwner);
        if (currentUser) {
          this.selectedUserId = currentUser.id;
        }
        
      } catch (error) {
        console.error('Error al cargar datos:', error);
        alert('Error al cargar los datos de la nota');
      } finally {
        this.loading = false;
      }
    },
    
    async saveChanges() {
      if (!this.hasChanges || !this.selectedUserId) return;
      
      try {
        this.saving = true;
        
        const noteOwnerData = {
          userId: parseInt(this.selectedUserId)
        };
        
        // Llamar al endpoint para cambiar propietario
        await NoteRepository.changeOwner(this.note.id, noteOwnerData);
        
        alert('Propietario cambiado correctamente');
        this.$router.push('/notes');
        
      } catch (error) {
        console.error('Error al cambiar propietario:', error);
        let errorMessage = 'Error al cambiar el propietario de la nota';
        
        if (error.response?.status === 403) {
          errorMessage = 'No tiene permisos para realizar esta acción';
        } else if (error.response?.status === 404) {
          errorMessage = 'Nota o usuario no encontrado';
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }
        
        alert(errorMessage);
      } finally {
        this.saving = false;
      }
    },
    
    cancel() {
      this.$router.push('/notes');
    },
    
    formatDate(timestamp) {
      if (!timestamp) return '';
      const date = new Date(timestamp);
      return date.toLocaleDateString('es-ES') + ' ' + date.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  }
};
</script>

<style scoped>
.form-control-plaintext {
  background-color: #f8f9fa;
}

.border-success {
  border-color: #198754 !important;
  box-shadow: 0 0 0 0.25rem rgba(25, 135, 84, 0.25);
}

.bg-opacity-25 {
  --bs-bg-opacity: 0.25;
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}
</style>