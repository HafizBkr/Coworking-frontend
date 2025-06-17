import { Users, Shield, TrendingUp, Calendar } from "lucide-react";

export default function BuiltForEveryone() {
  return (
    <div className="bg-gray-50 py-16 px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Conçu pour tous les membres de votre communauté
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Que vous soyez freelance, manager ou membre d'une équipe, notre
            plateforme s'adapte à vos besoins pour collaborer efficacement en
            ligne.
          </p>
        </div>

        {/* Main Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Professionnels */}
          <div className="bg-white rounded-3xl p-8 shadow-lg flex flex-col items-center">
            <div className="mb-6">
              <div className="bg-gray-100 rounded-2xl p-6 mb-4 flex items-center justify-center">
                <Users className="w-12 h-12 text-purple-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Pour les professionnels
            </h3>
            <p className="text-gray-600 text-center">
              Centralisez vos projets, tâches et échanges dans un espace
              sécurisé et accessible à tout moment.
            </p>
          </div>

          {/* Managers */}
          <div className="bg-white rounded-3xl p-8 shadow-lg flex flex-col items-center">
            <div className="mb-6">
              <div className="bg-gray-100 rounded-2xl p-6 mb-4 flex items-center justify-center">
                <TrendingUp className="w-12 h-12 text-blue-500" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Pour les managers
            </h3>
            <p className="text-gray-600 text-center">
              Suivez l’activité de vos équipes en temps réel, organisez des
              réunions vidéo et gardez une vue d’ensemble sur la progression des
              projets.
            </p>
          </div>

          {/* Sécurité */}
          <div className="bg-white rounded-3xl p-8 shadow-lg flex flex-col items-center">
            <div className="mb-6">
              <div className="bg-gray-100 rounded-2xl p-6 mb-4 flex items-center justify-center">
                <Shield className="w-12 h-12 text-green-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Sécurité & Confiance
            </h3>
            <p className="text-gray-600 text-center">
              Profitez d’un environnement de travail en ligne sécurisé, pensé
              pour la collaboration, la communication instantanée et la gestion
              efficace de vos espaces de coworking virtuels.
            </p>
          </div>
        </div>

        {/* Bottom Cards: Présence et cercle équipe */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Présence en ligne */}
          <div className="bg-white rounded-3xl p-8 shadow-lg">
            <div className="bg-gray-100 rounded-2xl p-6">
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="font-semibold">Présence en Ligne</h4>
                  <div className="flex space-x-2">
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                      Daily
                    </span>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                      Weekly
                    </span>
                    <span className="text-xs bg-black text-white px-2 py-1 rounded">
                      Monthly
                    </span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Membres</span>
                    <div className="flex space-x-4">
                      <span className="text-xs bg-black text-white px-2 py-1 rounded">
                        Présents: 24
                      </span>
                      <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                        Absents: 8
                      </span>
                    </div>
                  </div>
                  {/* Exemples de membres */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                      <div>
                        <div className="font-medium text-sm">William Gray</div>
                        <div className="text-xs text-gray-500">
                          Développeur Frontend
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                      <div>
                        <div className="font-medium text-sm">
                          Darrin Rydzall
                        </div>
                        <div className="text-xs text-gray-500">Manager</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex justify-center">
                  <div className="w-12 h-8 bg-purple-500 rounded"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Cercle équipe */}
          <div className="bg-white rounded-3xl p-8 shadow-lg">
            <div className="bg-gray-100 rounded-2xl p-6 flex items-center justify-center">
              <div className="relative w-48 h-48">
                {/* Center icons */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex space-x-2">
                    <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
                {/* Profile pictures in circle */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-10 bg-gray-300 rounded-full"></div>
                <div className="absolute top-4 right-4 w-10 h-10 bg-gray-300 rounded-full"></div>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-gray-300 rounded-full"></div>
                <div className="absolute bottom-4 right-4 w-10 h-10 bg-gray-300 rounded-full"></div>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-10 bg-gray-300 rounded-full"></div>
                <div className="absolute bottom-4 left-4 w-10 h-10 bg-gray-300 rounded-full"></div>
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-gray-300 rounded-full"></div>
                <div className="absolute top-4 left-4 w-10 h-10 bg-gray-300 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
