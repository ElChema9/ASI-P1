import { createRouter, createWebHistory } from "vue-router";

import AboutView from "../views/AboutView.vue";
import ErrorNotFoundView from "../views/ErrorNotFoundView.vue";
import LoginForm from "@/components/LoginForm.vue";
import RegisterForm from "@/components/RegisterForm.vue";
import UserList from "@/components/UserList.vue";

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
    meta: { requiresAuth: true, requiresAdmin: true }
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
  const store = getStore();
  
  if (to.matched.some((record) => !record.meta.public)) {
    if (!auth.isAuthenticationChecked) {
      auth
        .checkAuthentication()
        .then(() => {
          if (!store.state.user.logged) {
            next("/login");
          } else {
            // Verificar si requiere admin
            if (to.meta.requiresAdmin && !auth.isAdmin()) {
              console.log('No es admin, redirigiendo a /notes');
              next("/notes");
            } else {
              next();
            }
          }
        })
        .catch(() => {
          next("/login");
        });
    } else if (!store.state.user.logged) {
      next("/login");
    } else {
      // Verificar si requiere admin
      if (to.meta.requiresAdmin && !auth.isAdmin()) {
        console.log('No es admin, redirigiendo a /notes');
        next("/notes");
      } else {
        next();
      }
    }
  } else {
    next();
  }
});

export default router;
