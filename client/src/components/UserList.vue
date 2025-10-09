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
          <th>Nº de notas</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.login">
          <td>{{ user.login }}</td>
          <td>{{ user.notesCount }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import HTTP from "@/common/http";
import NoteRepository from "@/repositories/NoteRepository";

export default {
  data() {
    return {
      users: []
    };
  },
  async mounted() {
    try {
      const responseUsers = await HTTP.get("users");
      const allUsers = responseUsers.data;
      const allNotes = await NoteRepository.findAll();
      
      this.users = allUsers.map(user => ({
        login: user.login,
        notesCount: allNotes.filter(note => note.owner === user.login).length
      }));
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    }
  }
};
</script>