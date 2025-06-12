"use client";
import type * as React from "react"
import { Calendar, Sparkles, LayoutDashboard, BookOpen, Users, Package, ChevronRight, Command, GalleryVerticalEnd, AudioWaveform } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { WorkSpaceSwitcher } from "./workspace-switcher"
import { Logo } from "@/components/customs/logo";
import { cn } from "@/lib/utils";
import { Pacifico } from "next/font/google";

// Menu data structure
const menuItems = [
  {
    title: "Calendar",
    icon: Calendar,
    url: "#",
  },
  {
    title: "Sparkles",
    icon: Sparkles,
    url: "#",
  },
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    url: "#",
    isActive: true,
  },
  {
    title: "Bookings",
    icon: BookOpen,
    url: "#",
    items: [
      {
        title: "View Available Options",
        url: "#",
      },
      {
        title: "Calendar",
        url: "#",
      },
      {
        title: "Floor Plan",
        url: "#",
      },
    ],
  },
  {
    title: "Products and Services",
    icon: Package,
    url: "#",
  },
  {
    title: "Community",
    icon: Users,
    url: "#",
    items: [
      {
        title: "Discussion Boards",
        url: "#",
      },
      {
        title: "Virtual Rooms",
        url: "#",
        isActive: true,
      },
      {
        title: "Articles",
        url: "#",
      },
      {
        title: "Events",
        url: "#",
      },
      {
        title: "Directory",
        url: "#",
      },
    ],
  },
]

const pacifico = Pacifico({
    weight:["400"],
    subsets:["latin"]
  })

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { open } = useSidebar()
  return (
    <Sidebar className="bg-background" collapsible="icon" {...props}>
    <SidebarHeader className="bg-background">
        <div className={cn("flex px-2 pt-2",{
            "flex-col items-center gap-2": !open
        })}>
            <SidebarTrigger hidden={open} />
            <div className="flex gap-2 items-center ">
                <Logo/>
                <h1 hidden={!open} className={cn(`${pacifico.className} font-bold text-xl`)}>Working</h1>
            </div>
        </div>
        {/* <WorkSpaceSwitcher workspaces={workspaces}/> */}
    </SidebarHeader>
      <SidebarContent className="bg-background">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {item.items ? (
                    <Collapsible defaultOpen className="group/collapsible">
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton tooltip={item.title} isActive={item.isActive}>
                          <item.icon />
                          <span>{item.title}</span>
                          <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.items.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton asChild isActive={subItem.isActive}>
                                <a href={subItem.url}>
                                  <span>{subItem.title}</span>
                                </a>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </Collapsible>
                  ) : (
                    <SidebarMenuButton asChild tooltip={item.title} isActive={item.isActive}>
                      <a href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
