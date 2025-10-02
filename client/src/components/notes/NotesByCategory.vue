<template>
  <div class="container">
    <h1>Notas de la categoría: {{ categoryName }}</h1>
    <p class="text-muted">Mostrando {{ notes.length }} notas</p>
    
    <router-link to="/notes" class="btn btn-secondary mb-3">
      ← Volver al listado principal
    </router-link>

    <div v-if="notes.length === 0" class="alert alert-info">
      No tienes notas en esta categoría.
    </div>
    <div v-else class="row row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xxl-4">
      <div class="col mb-3" v-for="note in notes" :key="note.id">
        <NoteCard :note="note"></NoteCard>
      </div>
    </div>
  </div>
</template>

<script>
import NoteRepository from "@/repositories/NoteRepository";
import CategoryRepository from "@/repositories/CategoryRepository";
import NoteCard from "./NoteCard.vue";

export default {
  components: { NoteCard },
  data() {
    return {
      notes: [],
      categoryName: ""
    };
  },
  async mounted() {
    const categoryId = this.$route.params.categoryId;
    console.log('Category ID desde route:', categoryId);
    
    // Obtener el nombre de la categoría
    try {
      const category = await CategoryRepository.findOne(categoryId);
      console.log('Categoría encontrada:', category);
      this.categoryName = category.name;
    } catch (e) {
      console.error('Error al obtener categoría:', e);
      this.categoryName = "Categoría desconocida";
    }
    
    // Obtener las notas de esa categoría
    try {
      this.notes = await NoteRepository.findByCategory(categoryId);
      console.log('Notas encontradas:', this.notes);
    } catch (e) {
      console.error('Error al obtener notas por categoría:', e);
      this.notes = [];
    }
  }
};
</script>