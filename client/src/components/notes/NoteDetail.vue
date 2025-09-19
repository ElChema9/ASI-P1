<template>
  <div v-if="note != null">
    <div>
      <span>Título</span>
      <span>{{ note.title }}</span>
    </div>
    <div>
      <span>Contenido</span>
      <span>{{ note.content }}</span>
    </div>
    <div>
      <span>Categorías</span>
      <p>
        <span>{{ categoriesAsString }}</span>
      </p>
    </div>
    <div>
      <span>Fecha </span>
      <span
        >{{ note.timestamp.toLocaleDateString() }} - {{ note.timestamp.toLocaleTimeString() }}</span
      >
    </div>
  </div>
</template>

<script>
import NoteRepository from "@/repositories/NoteRepository";

export default {
  data() {
    return {
      note: null
    };
  },
  computed: {
    categoriesAsString() {
      return this.note.categories
        .map(function (cat) {
          return cat.name;
        })
        .join(", ");
    }
  },
  async mounted() {
    this.note = await NoteRepository.findOne(this.$route.params.noteId);
  }
};
</script>
