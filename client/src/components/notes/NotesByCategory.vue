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
    
    // Obtener el nombre de la categoría
    try {
      const category = await CategoryRepository.findOne(categoryId);
      this.categoryName = category.name;
    } catch (e) {
      this.categoryName = "Categoría desconocida";
    }
    
    // Obtener las notas de esa categoría
    this.notes = await NoteRepository.findByCategory(categoryId);
  }
};
</script>