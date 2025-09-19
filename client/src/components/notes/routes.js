import NoteDetail from "./NoteDetail.vue";
import NoteList from "./NoteList.vue";

export default [
  {
    path: "/notes",
    name: "NoteList",
    component: NoteList
  },
  {
    path: "/notes/:noteId",
    name: "DetalleNota",
    component: NoteDetail
  }
];
