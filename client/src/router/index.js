import { createRouter, createWebHistory } from "vue-router";

import AboutView from "../views/AboutView.vue";
import ErrorNotFoundView from "../views/ErrorNotFoundView.vue";
import LoginForm from "@/components/LoginForm.vue";
import RegisterForm from "@/components/RegisterForm.vue";
import UserList from "@/components/UserList.vue";
import ChangeNoteOwnerView from "../views/ChangeNoteOwnerView.vue";
import UserNotesView from "../views/UserNotesView.vue";

import noteRoutes from "@/components/notes/routes";

import auth from "@/common/auth";
import { getStore } from "@/common/store";

const routes = [
  {
    path: "/",
    component: LoginForm,
    meta: { public: true }
  },
  {
    path: "/login",
    component: LoginForm,
    meta: { public: true }
  },
  {
    path: "/register",
    component: RegisterForm,
    meta: { public: true }
  },
  {
    path: "/about",
    name: "about",
    component: AboutView,
    meta: { requiresAuth: true }
  },
  {
    path: "/users",
    name: "userList",
    component: UserList,
    meta: { requiresAuth: true, authority: "ADMIN" }
  },
  {
    path: "/notes/:id/change-owner",
    name: "changeNoteOwner",
    component: ChangeNoteOwnerView,
    meta: { requiresAuth: true, authority: "ADMIN" }
  },
  {
    path: "/users/:login/notes",
    name: "userNotes",
    component: UserNotesView,
    meta: { requiresAuth: true, authority: "ADMIN" }
  },
  ...noteRoutes,
  {
    path: "/:pathMatch(.*)*",
    component: ErrorNotFoundView
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

router.beforeEach((to, from, next) => {
  // Lo primero que hacemos antes de cargar ninguna ruta es comprobar si
  // el usuario está autenticado (revisando el token)
  auth.isAuthenticationChecked.finally(() => {
    // por defecto, el usuario debe estar autenticado para acceder a las rutas
    const requiresAuth = !to.meta.public;

    const requiredAuthority = to.meta.authority;
    const userIsLogged = getStore().state.user.logged;
    const loggedUserAuthority = getStore().state.user.authority;
    const guestOnly = to.meta.guestOnly; // Definido para trabajar con la vista pública

    if (requiresAuth) {
      // página privada
      if (userIsLogged) {
        if (requiredAuthority && requiredAuthority != loggedUserAuthority) {
          // usuario logueado pero sin permisos suficientes, le redirigimos a la página de login
          alert("Acceso prohibido para el usuario actual; intenta autenticarte de nuevo");
          auth.logout();
          next("/");
        } else {
          // usuario logueado y con permisos adecuados
          next();
        }
      } else {
        // usuario no está logueado, no puede acceder a la página
        alert("Esta página requiere autenticación");
        next("/");
      }
    } else {
      // página pública
      if (userIsLogged && guestOnly) {
        // si estamos logueados no hace falta volver a mostrar el login
        next({ name: "NoteList", replace: true });
      } else {
        next();
      }
    }
  });
});

export default router;
