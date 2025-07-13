import { getSession } from '@/services/auth/session.service';
import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';

// Création d'une instance axios
const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL!,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Intercepteur pour les requêtes
api.interceptors.request.use(
  async (config) => {
    // Vous pouvez ajouter des tokens d'authentification ici
    const session = await getSession()
    if (session?.token) {
      config.headers.Authorization = `Bearer ${session?.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour les réponses
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data as { message: string};
      console.log({data})
      const message = data.message;

      switch (status) {
        case 400:
          console.error('Erreur 400: Requête incorrecte');
          return {
            data: {
             success:false,
             error: message
            }
          }
        case 401:
            console.error('Erreur 401: Non autorisé');
            return {
              data: {
                success:false,
                error: message
            }
          }
        case 403:
            console.error('Erreur 403: Accès interdit');
            return {
              data: {
                success:false,
                error: "Accès interdit !"
              }
            };
        case 404:
            console.error('Erreur 404: Ressource non trouvée');
            return {
              data: {
                success:false,
                error: "Ressource introuvable !"
              }
            }
        case 500:
            throw Error('Erreur 500: Erreur serveur interne');
        default:
          console.error(`Erreur ${status}: ${error.message}`);
          throw Error(`Erreur ${status}: ${error.message}`)
      }

    } else if (error.request) {
      console.error('Erreur de requête: Pas de réponse reçue');
    } else {
      console.error('Erreur:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;
