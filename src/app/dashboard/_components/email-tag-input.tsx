"use client"
import type React from "react"
import { useState, type KeyboardEvent, type ChangeEvent, useTransition } from "react"
import { X, Mail } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { inviteUserWorkspace } from "../_services/workspace.service"
import { toast } from "sonner"
import { useWorkspaceStore } from "@/stores/workspace.store"

interface EmailTagInputProps {
  onEmailsChange?: (emails: string[]) => void
  placeholder?: string
  maxEmails?: number
}

export default function EmailTagInput({
  onEmailsChange,
  placeholder = "Saisir les emails d'invitation...",
  maxEmails = 10,
}: EmailTagInputProps) {
  const [emails, setEmails] = useState<string[]>([])
  const [inputValue, setInputValue] = useState("")
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const { currentWorkspace } = useWorkspaceStore()
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email.trim())
  }

  const addEmail = (email: string) => {
    const trimmedEmail = email.trim().toLowerCase()

    if (!trimmedEmail) return

    if (!isValidEmail(trimmedEmail)) {
      setError("Format d'email invalide")
      return
    }

    if (emails.includes(trimmedEmail)) {
      setError("Cet email est déjà ajouté")
      return
    }

    if (emails.length >= maxEmails) {
      setError(`Maximum ${maxEmails} emails autorisés`)
      return
    }

    const newEmails = [...emails, trimmedEmail]
    setEmails(newEmails)
    setInputValue("")
    setError("")
    onEmailsChange?.(newEmails)
  }

  const removeEmail = (emailToRemove: string) => {
    const newEmails = emails.filter((email) => email !== emailToRemove)
    setEmails(newEmails)
    onEmailsChange?.(newEmails)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      addEmail(inputValue)
    } else if (e.key === "Backspace" && !inputValue && emails.length > 0) {
      removeEmail(emails[emails.length - 1])
    }
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
    if (error) setError("")
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedText = e.clipboardData.getData("text")
    const emailList = pastedText.split(/[,;\s]+/).filter(Boolean)

    emailList.forEach((email) => {
      if (emails.length < maxEmails) {
        addEmail(email)
      }
    })
    
  }

  const clearAll = () => {
    setEmails([])
    setInputValue("")
    setError("")
    onEmailsChange?.([])
  }

  const handleSendInvitations = () => {
    startTransition(async () => {
      const response = await inviteUserWorkspace(emails, currentWorkspace?._id||"")
        if (response.success) {
          toast.success("Invitations envoyées avec succès")
          clearAll()
        } else {
          toast.error("Erreur lors de l'envoi des invitations")
        }
      })
  }

  return (
    <Card className="w-full max-w-3xl shadow-none border-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5" />
          Inviter des membres
        </CardTitle>
        <CardDescription>
          Saisissez les adresses email et appuyez sur Entrée ou utilisez une virgule pour les séparer
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="min-h-[100px] p-3 border rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:border-ring">
            <div className="flex flex-wrap gap-2 mb-2">
              {emails.map((email) => (
                <Badge key={email} variant="secondary" className="flex items-center gap-1">
                  {email}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => removeEmail(email)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </Badge>
              ))}
            </div>
            <Input
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              placeholder={emails.length === 0 ? placeholder : "Ajouter un autre email..."}
              className="border-0 shadow-none p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {emails.length} / {maxEmails} emails ajoutés
            </span>
            {emails.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearAll}>
                Tout effacer
              </Button>
            )}
          </div>
        </div>

        <form action={handleSendInvitations} className="flex gap-2">
          <Button
            loading={isPending}
            className="flex-1"
            disabled={emails.length === 0}
            onClick={() => {
              console.log("Envoi des invitations à:", emails)
              // Ici vous pouvez ajouter la logique d'envoi
            }}
          >
            Envoyer {emails.length > 0 && `(${emails.length})`} invitation{emails.length > 1 ? "s" : ""}
          </Button>
        </form>

        <div className="text-xs text-muted-foreground">
          <p>💡 Astuces :</p>
          <ul className="list-disc list-inside space-y-1 mt-1">
            <li>Appuyez sur Entrée ou utilisez une virgule pour ajouter un email</li>
            <li>Utilisez Backspace pour supprimer le dernier email</li>
            <li>Vous pouvez coller plusieurs emails séparés par des virgules</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
