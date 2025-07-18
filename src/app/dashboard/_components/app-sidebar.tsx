"use client";
import { CalendarDays, FolderOpen, LayoutDashboard, MailboxIcon, SettingsIcon, Video } from "lucide-react";
import type * as React from "react";

import { Logo } from "@/components/customs/logo";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
  useSidebar
} from "@/components/ui/sidebar";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";
import { Pacifico } from "next/font/google";
import { usePathname, useRouter } from "next/navigation";
import { LogoutButton } from "./logout-button";
import { useWorkspaceStore } from "@/stores/workspace.store";

// Menu data structure

const pacifico = Pacifico({
    weight:["400"],
    subsets:["latin"]
  })

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { open } = useSidebar()
    const pathname = usePathname();
    const router = useRouter();
    const { currentWorkspace } = useWorkspaceStore();
    const menuItems = [
      {
        title: "Tableau de bord",
        icon: LayoutDashboard,
        url: routes.dashboard.home,
        isActive: pathname === routes.dashboard.home,
      },
      {
        title: "Calendrier",
        icon: CalendarDays,
        url: routes.dashboard.calendar,
        isActive: pathname === routes.dashboard.calendar,
        isHide: !currentWorkspace
      },
      {
        title: "Projets",
        icon: FolderOpen,
        url: routes.dashboard.projects,
        isActive: pathname.includes(routes.dashboard.projects),
        isHide: !currentWorkspace
      },
      {
        title: "Messagerie",
        icon: MailboxIcon,
        url: routes.dashboard.chat,
        isActive: pathname === routes.dashboard.chat,
        isHide: !currentWorkspace
      },
      {
        title: "Reunions",
        icon: Video,
        url: routes.dashboard.meet,
        isActive: pathname === routes.dashboard.meet,
        isHide: !currentWorkspace
      },
      {
        title: "Parametres",
        icon: SettingsIcon,
        url: routes.dashboard.meet,
        isActive: pathname === routes.dashboard.settings,
        isHide: !currentWorkspace
      }
    ]
    
  return (
    <Sidebar className="bg-background" collapsible="icon" {...props}>
    <SidebarHeader  className={!open ? "px-1 bg-background" : "bg-background"}>
        <div className={cn("flex items-center justify-between px-2 pt-2",{
            "flex-col-reverse items-center gap-2 px-0": !open
        })}>
            <div className="flex gap-2 items-center ">
                <Logo/>
                <h1 hidden={!open} className={cn(`${pacifico.className} font-bold text-xl`)}>Working</h1>
            </div>
            <SidebarTrigger  />
        </div>
        {/* <WorkSpaceSwitcher workspaces={workspaces}/> */}
    </SidebarHeader>
      <SidebarContent className="bg-background">
        <SidebarGroup className={!open ? "p-1" : ""}>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      onClick={()=>router.push(item.url)}
                     asChild tooltip={item.title} className="h-14" isActive={item.isActive}>
                      <div className="cursor-pointer">
                        <item.icon className={cn({
                          // "text-primary": item.isActive
                        })} strokeWidth={1.5} />
                        <span className="text-lg">{item.title}</span>
                      </div>
                    </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
      <SidebarFooter className="bg-background">
        <LogoutButton/>
      </SidebarFooter>
    </Sidebar>
  )
}
