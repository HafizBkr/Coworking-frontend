/* eslint-disable react/react-in-jsx-scope */
import { User } from "lucide-react";

export default function CoreHRHero() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center relative">
      {/* Container principal centré */}
      <div className="relative w-full max-w-7xl mx-auto px-8 flex items-center justify-center">
        {/* Demi-cercle gauche - parfaitement centré */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2">
          <div className="relative w-80 h-96 flex items-center justify-center">
            {/* Images décoratives */}
            {/* ... (conserve les images comme dans le code original) ... */}
          </div>
        </div>

        {/* Contenu central */}
        <div className="flex flex-col items-center justify-center text-center z-10 bg-gray-100">
          {/* Icône utilisateur */}
          <div className="mb-8 flex items-center justify-center">
            <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center">
              <User className="w-8 h-8 text-purple-500" />
            </div>
          </div>

          {/* Titre principal */}
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Gestion centralisée
            <br />
            des équipes & projets
          </h1>

          {/* Sous-titre */}
          <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto leading-relaxed">
            Simplifiez la gestion de vos membres, projets et espaces de travail
            dans une seule plateforme collaborative. Favorisez la transparence,
            la communication et la productivité de votre équipe grâce à des
            outils intégrés de chat et de visioconférence.
          </p>

          {/* Bouton CTA */}
          <div className="flex items-center justify-center">
            <button className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-4 px-8 rounded-2xl text-lg transition-colors duration-200 shadow-lg">
              Créer mon espace de coworking
            </button>
          </div>
        </div>

        {/* Demi-cercle droit - parfaitement centré */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2">
          <div className="relative w-80 h-96 flex items-center justify-center">
            {/* Images décoratives */}
            {/* ... (conserve les images comme dans le code original) ... */}
          </div>
        </div>
      </div>
    </div>
  );
}
