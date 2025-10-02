<template>
  <div>
    <h2>Registro de Usuario</h2>
    <form @submit.prevent="registrarse">
      <div class="mb-3 mt-3">
        <label for="login">Usuario: </label>
        <input 
          type="text" 
          id="login" 
          v-model="auxLogin" 
          required
          :disabled="isLoading"
          minlength="3"
        />
      </div>
      <div class="mb-3">
        <label for="pass">Contraseña: </label>
        <input 
          type="password" 
          id="pass" 
          v-model="auxPass" 
          required
          :disabled="isLoading"
          minlength="6"
        />
      </div>
      <div class="mb-3">
        <label for="passConfirm">Confirmar Contraseña: </label>
        <input 
          type="password" 
          id="passConfirm" 
          v-model="auxPassConfirm" 
          required
          :disabled="isLoading"
          minlength="6"
        />
      </div>
      <div v-if="errorMessage" class="alert alert-danger">
        {{ errorMessage }}
      </div>
      <div v-if="successMessage" class="alert alert-success">
        {{ successMessage }}
      </div>
      <div class="d-flex gap-2">
        <button type="submit" :disabled="isLoading" class="btn btn-primary">
          {{ isLoading ? 'Registrando...' : 'Registrarse' }}
        </button>
        <button 
          type="button" 
          @click="volverLogin" 
          :disabled="isLoading"
          class="btn btn-secondary"
        >
          Volver al Login
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
      auxPassConfirm: '',
      isLoading: false,
      errorMessage: '',
      successMessage: ''
    };
  },
  methods: {
    async registrarse() {
      this.errorMessage = '';
      this.successMessage = '';

      // Validar que las contraseñas coincidan
      if (this.auxPass !== this.auxPassConfirm) {
        this.errorMessage = 'Las contraseñas no coinciden';
        return;
      }

      // Validar longitud mínima
      if (this.auxLogin.length < 3) {
        this.errorMessage = 'El usuario debe tener al menos 3 caracteres';
        return;
      }

      if (this.auxPass.length < 6) {
        this.errorMessage = 'La contraseña debe tener al menos 6 caracteres';
        return;
      }

      this.isLoading = true;

      try {
        console.log('Intentando registrar:', this.auxLogin); // DEBUG
        
        const result = await auth.register({
          login: this.auxLogin,
          password: this.auxPass
        });
        
        console.log('Registro exitoso:', result); // DEBUG
        
        this.successMessage = 'Usuario registrado correctamente. Redirigiendo al login...';
        
        // Redirigir al login después de 2 segundos
        setTimeout(() => {
          this.$router.push("/");
        }, 2000);
        
      } catch (e) {
        console.error('Error completo:', e); // DEBUG - MUY IMPORTANTE
        console.error('Response:', e.response); // DEBUG
        
        if (e.response?.status === 409) {
          this.errorMessage = `El usuario "${this.auxLogin}" ya existe. Por favor, elige otro nombre.`;
        } else if (e.response?.status === 400) {
          this.errorMessage = e.response?.data?.message || 'Datos inválidos. Verifica los campos.';
        } else if (e.response?.status === 404) {
          this.errorMessage = 'El endpoint de registro no existe. Contacta al administrador.';
        } else {
          this.errorMessage = e.response?.data?.message || e.message || 
                             'Error al registrar usuario. Intenta con otro nombre.';
        }
      } finally {
        this.isLoading = false;
      }
    },
    volverLogin() {
      this.$router.push("/");
    }
  }
};
</script>

<style scoped>
.alert {
  padding: 10px;
  margin: 10px 0;
  border-radius: 4px;
}

.alert-danger {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.alert-success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
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