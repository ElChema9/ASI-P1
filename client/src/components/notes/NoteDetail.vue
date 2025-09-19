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
  async mounted() {
    this.note = await NoteRepository.findOne(this.$route.params.noteId);
  }
};
</script>
