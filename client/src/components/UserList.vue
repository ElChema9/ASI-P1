<template>
  <div class="container mt-4">
    <h2>Listado de usuarios</h2>
    <div v-if="users.length === 0" class="alert alert-info">
      Cargando usuarios...
    </div>
    <table v-else class="table table-striped">
      <thead>
        <tr>
          <th>Login</th>
          <th>Estado</th>
          <th>Nº de notas</th>
          <th v-if="isAdmin" class="text-center">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.id">
          <td>
            <router-link 
              :to="{ name: 'userNotes', params: { login: user.login }, query: { from: 'users' } }"
              class="text-decoration-none user-link"
              :title="`Ver notas de ${user.login}`"
            >
              <span class="badge bg-primary">{{ user.login }}</span>
            </router-link>
          </td>
          <td>
            <span v-if="user.active" class="badge bg-success">Activo</span>
            <span v-else class="badge bg-secondary">Inactivo</span>
          </td>
          <td>
            <span class="badge bg-info">{{ user.notesCount }}</span>
          </td>
          <td v-if="isAdmin" class="text-center">
            <div class="btn-group" role="group">
              <button v-if="!user.active" 
                      @click="activateUser(user)" 
                      class="btn btn-sm btn-success" 
                      :disabled="loading">
                Activar
              </button>
              <button v-if="user.active && user.login !== currentUserLogin" 
                      @click="deactivateUser(user)" 
                      class="btn btn-sm btn-warning" 
                      :disabled="loading">
                Desactivar
              </button>
              <button v-if="user.login !== currentUserLogin"
                      @click="deleteUser(user)" 
                      class="btn btn-sm btn-danger" 
                      :disabled="loading">
                Eliminar
              </button>
              <span v-if="user.login === currentUserLogin" class="text-muted small">
                (Usuario actual)
              </span>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import UserRepository from "@/repositories/UserRepository";
import NoteRepository from "@/repositories/NoteRepository";
import auth from "@/common/auth";
import { getStore } from "@/common/store";

export default {
  data() {
    return {
      users: [],
      loading: false
    };
  },
  computed: {
    isAdmin() {
      return auth.isAdmin();
    },
    currentUserLogin() {
      return getStore().state.user.login;
    }
  },
  async mounted() {
    await this.loadUsers();
  },
  methods: {
    async loadUsers() {
      try {
        this.loading = true;
        const allUsers = await UserRepository.findAll();
        const allNotes = await NoteRepository.findAll();
        
        this.users = allUsers.map(user => ({
          id: user.id,
          login: user.login,
          active: user.active,
          notesCount: allNotes.filter(note => note.owner === user.login).length
        }));
      } catch (error) {
        console.error('Error al cargar usuarios:', error);
        alert('Error al cargar la lista de usuarios');
      } finally {
        this.loading = false;
      }
    },
    
    async activateUser(user) {
      try {
        this.loading = true;
        await UserRepository.activate(user.id);
        await this.loadUsers(); // Recargar la lista
        alert(`Usuario ${user.login} activado correctamente`);
      } catch (error) {
        console.error('Error al activar usuario:', error);
        alert('Error al activar el usuario');
      } finally {
        this.loading = false;
      }
    },
    
    async deactivateUser(user) {
      if (!confirm(`¿Estás seguro de que deseas desactivar al usuario ${user.login}? No podrá autenticarse hasta que sea reactivado.`)) {
        return;
      }
      
      try {
        this.loading = true;
        await UserRepository.deactivate(user.id);
        await this.loadUsers(); // Recargar la lista
        alert(`Usuario ${user.login} desactivado correctamente`);
      } catch (error) {
        console.error('Error al desactivar usuario:', error);
        let errorMessage = 'Error al desactivar el usuario';
        
        if (error.response?.status === 400 || error.response?.status === 403) {
          errorMessage = 'No puedes desactivar tu propio usuario';
        } else if (error.response?.status === 404) {
          errorMessage = 'Usuario no encontrado';
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }
        
        alert(errorMessage);
      } finally {
        this.loading = false;
      }
    },
    
    async deleteUser(user) {
      if (!confirm(`¿Estás seguro de que deseas eliminar al usuario ${user.login}? Se eliminarán también todas sus notas. Esta acción no se puede deshacer.`)) {
        return;
      }
      
      try {
        this.loading = true;
        await UserRepository.delete(user.id);
        await this.loadUsers(); // Recargar la lista
        alert(`Usuario ${user.login} eliminado correctamente`);
      } catch (error) {
        console.error('Error al eliminar usuario:', error);
        let errorMessage = 'Error al eliminar el usuario';
        
        if (error.response?.status === 400 || error.response?.status === 403) {
          errorMessage = 'No puedes eliminar tu propio usuario';
        } else if (error.response?.status === 404) {
          errorMessage = 'Usuario no encontrado';
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }
        
        alert(errorMessage);
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.user-link {
  transition: all 0.2s ease;
}

.user-link:hover .badge {
  background-color: #0056b3 !important;
  transform: scale(1.1);
}

.user-link:hover {
  text-decoration: none !important;
}

.table td {
  vertical-align: middle;
}
</style>