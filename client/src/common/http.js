import axios from "axios";
import { BACKEND_URL } from "../constants.js";
import auth from "./auth.js";

const HTTP = axios.create({
  baseURL: BACKEND_URL
});

const onUnauthorized = () => {
  console.error("Access denied!");
  auth.logout();
};

const onResponseSuccess = (response) => response;

const onResponseFailure = (err) => {
  const status = err.response?.status;
  const url = err.config.url;
  
  if (!err.config.url.includes("authenticate")) {
    if (status === 401) {
      // Verificar si es realmente un problema de token expirado
      const errorMessage = err.response?.data?.message || '';
      if (errorMessage.includes('token') || errorMessage.includes('expired') || errorMessage.includes('invalid')) {
        onUnauthorized();
      }
    } else if (status === 403) {
      // Si es un error de permisos en operaciones de notas, NO hacer logout
      if (url.includes('notes/') && (url.includes('archive') || url.includes('unarchive') || err.config.method === 'put')) {
        console.warn('Sin permisos para modificar esta nota (no eres el propietario)');
        // NO llamar onUnauthorized() aquí
      } else {
        // Para otros 403, sí hacer logout
        onUnauthorized();
      }
    }
  }
  return Promise.reject(err);
};

// en cada request hay que añadir el token de autenticación
const onRequest = (config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

HTTP.interceptors.response.use(onResponseSuccess, onResponseFailure);
HTTP.interceptors.request.use(onRequest);

export default HTTP;
