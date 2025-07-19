/* eslint-disable react/react-in-jsx-scope */
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
  } from "@/components/ui/alert-dialog"
  
  export default function DeleteDialog({ 
    open, 
    setOpen, 
    onClick, 
  }:{
    open: boolean,
    setOpen: (e:boolean)=>void,
    onClick?: ()=>void,
    label?: string;
    description?: string;
  }) {
    return (
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr&nbsp;?</AlertDialogTitle>
            <AlertDialogDescription>
              Prenez un moment pour vérifier les informations fournies afin de bien comprendre les implications.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={onClick}>Oui, supprime-le</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }
  