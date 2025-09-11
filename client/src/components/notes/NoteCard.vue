<template>
  <div class="card" style="width: 18rem">
    <div class="card-header">{{ note.owner }}</div>
    <div class="card-body">
      <h5 class="card-title">
        {{ note.title }}
      </h5>
      <h6 class="card-subtitle mb-2 text-muted">
        {{ note.timestamp.toLocaleDateString() }} - {{ note.timestamp.toLocaleTimeString() }}
      </h6>
      <p class="card-text">
        {{ note.content }}
      </p>
      <p class="card-text"></p>
    </div>
    <div v-if="categoriesAsString" class="card-footer">{{ categoriesAsString }}</div>
  </div>
</template>

<script>
export default {
  props: {
    note: {
      type: Object,
      required: true
    }
  },
  computed: {
    categoriesAsString() {
      return this.note?.categories.map((t) => t.name).join(", ");
    }
  }
};
</script>
