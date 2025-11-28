/**
 * Plugin Firebase pour Nuxt (Côté Client uniquement)
 *
 * Ce plugin initialise Firebase pour un usage futur.
 * Actuellement, il n'est pas utilisé car l'application est statique (SSG).
 *
 * Pour activer Firebase dans votre application :
 * 1. Installez Firebase SDK : pnpm add firebase
 * 2. Décommentez le code ci-dessous
 * 3. Importez les modules Firebase dont vous avez besoin
 *
 * Exemple d'utilisation :
 * - Firebase Auth pour l'authentification
 * - Firestore pour la base de données
 * - Firebase Storage pour le stockage de fichiers
 */

// import { initializeApp } from 'firebase/app'
// import { firebaseConfig } from '~/config/firebase.config'

export default defineNuxtPlugin(() => {
  // Décommentez pour activer Firebase
  // const app = initializeApp(firebaseConfig)

  // Exemple : Initialiser Firebase Auth
  // import { getAuth } from 'firebase/auth'
  // const auth = getAuth(app)

  // Exemple : Initialiser Firestore
  // import { getFirestore } from 'firebase/firestore'
  // const db = getFirestore(app)

  // return {
  //   provide: {
  //     firebase: app,
  //     auth,
  //     db
  //   }
  // }

  return {
    provide: {
      firebase: null // Firebase désactivé pour l'instant
    }
  }
})
