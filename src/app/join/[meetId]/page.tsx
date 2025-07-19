'use client'

import React, { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Video, ArrowRight } from 'lucide-react'
import { useSession } from '@/hooks/use-session'

/**
 * Page de redirection simple pour rejoindre une réunion
 * URL: /join/[meetId]
 * Redirige vers /dashboard/meet/[meetId] si connecté
 * Sinon, redirige vers la page de connexion avec le meetId
 */
export default function JoinMeetPage() {
  const router = useRouter()
  const params = useParams()
  const session = useSession()
  const meetId = params.meetId as string

  useEffect(() => {
    if (!meetId) {
      router.push('/dashboard/meet')
      return
    }

    // Redirection automatique après un court délai pour l'UX
    const timer = setTimeout(() => {
      if (session?.token) {
        // Utilisateur connecté -> aller directement à la réunion
        router.push(`/dashboard/meet/${meetId}`)
      } else {
        // Utilisateur non connecté -> aller à la page de connexion avec le meetId
        router.push(`/auth/signin?redirect=/dashboard/meet/${meetId}`)
      }
    }, 2000)

    return () => clearTimeout(timer)
  }, [meetId, session, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Video className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Rejoindre la réunion
            </h1>
            <p className="text-gray-600">
              Vous allez être redirigé vers la salle de conférence...
            </p>
          </div>

          <div className="space-y-4">
            {/* Loader */}
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>

            {/* Info */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>ID de réunion:</strong> {meetId}
              </p>
            </div>

            {/* Action manuelle si pas de redirection auto */}
            <div className="pt-4">
              <Button 
                onClick={() => {
                  if (session?.token) {
                    router.push(`/dashboard/meet/${meetId}`)
                  } else {
                    router.push(`/auth/signin?redirect=/dashboard/meet/${meetId}`)
                  }
                }}
                className="w-full"
              >
                {session?.token ? (
                  <>
                    Rejoindre maintenant
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                ) : (
                  'Se connecter pour rejoindre'
                )}
              </Button>
              
              <Button 
                variant="ghost" 
                onClick={() => router.push('/dashboard/meet')}
                className="w-full mt-2"
              >
                Retour aux réunions
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
