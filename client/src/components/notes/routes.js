import NoteList from "./NoteList.vue";
import NoteDetail from "./NoteDetail.vue";
import CreateNote from "./CreateNote.vue";
import NotesByCategory from "./NotesByCategory.vue";

export default [
  {
    path: "/notes",
    name: "notes",
    component: NoteList,
    meta: { requiresAuth: true }
  },
  {
    path: "/notes/create",
    name: "createNote",
    component: CreateNote,
    meta: { requiresAuth: true }
  },
  {
    path: "/notes/category/:categoryId",
    name: "notesByCategory",
    component: NotesByCategory,
    meta: { requiresAuth: true }
  },
  {
    path: "/notes/:noteId",
    name: "noteDetail",
    component: NoteDetail,
    meta: { requiresAuth: true }
  }
];
