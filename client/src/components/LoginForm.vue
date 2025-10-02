<template>
  <div>
    <form @submit.prevent="autenticarme">
      <div class="mb-3 mt-3">
        <label for="login">Login: </label>
        <input 
          type="text" 
          id="login" 
          v-model="auxLogin" 
          required
          :disabled="isLoading"
        />
      </div>
      <div class="mb-3">
        <label for="pass">Password: </label>
        <input 
          type="password" 
          id="pass" 
          v-model="auxPass" 
          required
          :disabled="isLoading"
        />
      </div>
      <div v-if="errorMessage" class="alert alert-danger">
        {{ errorMessage }}
      </div>
      <div class="d-flex gap-2">
        <button type="submit" :disabled="isLoading" class="btn btn-primary">
          {{ isLoading ? 'Autenticando...' : 'Autenticarse' }}
        </button>
        <button 
          type="button" 
          @click="irRegistro" 
          :disabled="isLoading"
          class="btn btn-secondary"
        >
          Registrarse
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import auth from "../common/auth.js";

export default {
  data() {
    return {
      auxLogin: '',
      auxPass: '',
      isLoading: false,
      errorMessage: ''
    };
  },
  methods: {
    async autenticarme() {
      this.isLoading = true;
      this.errorMessage = '';
      
      try {
        await auth.login({
          login: this.auxLogin,
          password: this.auxPass
        });
        this.$router.push("/notes");
      } catch (e) {
        console.error(e);
        this.errorMessage = e.response?.data?.message || 'Error de autenticación';
      } finally {
        this.isLoading = false;
      }
    },
    irRegistro() {
      this.$router.push("/register");
    }
  }
};
</script>

<style scoped>
.alert-danger {
  background-color: #f8d7da;
  color: #721c24;
  padding: 10px;
  margin: 10px 0;
  border-radius: 4px;
  border: 1px solid #f5c6cb;
}

.d-flex {
  display: flex;
}

.gap-2 {
  gap: 10px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #0056b3;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #5a6268;
}
</style>
