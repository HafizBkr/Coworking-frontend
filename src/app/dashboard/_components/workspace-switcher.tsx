"use client";
import * as React from "react"
import { ChevronsUpDown, Plus, ProportionsIcon } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useWorkspaces } from "../_hooks/use-workspaces";
import { WorkspaceDialog } from "./workspace-dialog";
import { useWorkspaceStore } from "@/stores/workspace.store";
import { useChatIdStore } from "@/stores/chat-id.store";


export function WorkSpaceSwitcher() {
  const { isMobile } = useSidebar();
  const { setCurrentWorkspace, currentWorkspace } = useWorkspaceStore();
  const { workspaces,error, isLoading }= useWorkspaces();
  const [openDialog, setOpenDialog] = React.useState(false);
  const { clearChatId } = useChatIdStore()

  // if(!workspaces?.[0]){
  //   return null
  // }

  // if (!ActiveWorkspace) {
  //   return null
  // }



  return (
    <>
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <ProportionsIcon  className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{currentWorkspace?.name||"Workspaces"}</span>
                <span className="truncate text-muted-foreground text-xs">{currentWorkspace?.description||"Selectionner un workspace"}</span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              workspaces
            </DropdownMenuLabel>

            {isLoading && (
              <DropdownMenuItem disabled className="gap-2 p-2">
                <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                  <ProportionsIcon className="size-4" />
                </div>
                Chargement des workspaces...
              </DropdownMenuItem>
            )}

            {workspaces?.map((workspace, index) => (
              <DropdownMenuItem
                key={workspace.name}
                onClick={() => {
                  clearChatId()
                  setCurrentWorkspace(workspace);
                }}
                className="gap-2 p-2"
              >
                <div className="flex size-6 items-center justify-center rounded-md border">
                  <ProportionsIcon className="size-3.5 shrink-0" />
                </div>
                {workspace.name}
                <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}

            {workspaces?.length === 0 && (
              <DropdownMenuItem disabled className="gap-2 p-2">
                <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                  <ProportionsIcon className="size-4" />
                </div>
                Aucun workspace disponible
              </DropdownMenuItem>
            )}

            {error && (
              <DropdownMenuItem disabled className="gap-2 p-2">
                <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                  <ProportionsIcon className="size-4" />
                </div>
                {error}
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setOpenDialog(true)}
              className="gap-2 p-2"
            >
              <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                <Plus className="size-4" />
              </div>
              <div className="text-muted-foreground font-medium">Ajouter un workspace</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
    <WorkspaceDialog open={openDialog} setOpen={setOpenDialog}/>
    </>
  )
}
