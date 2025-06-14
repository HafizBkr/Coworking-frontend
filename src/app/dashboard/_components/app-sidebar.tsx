"use client";
import { BookOpen, Calendar, LayoutDashboard, Package, Sparkles, Users } from "lucide-react";
import type * as React from "react";

import { Logo } from "@/components/customs/logo";
import {
  Sidebar,
  SidebarContent,
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
import { cn } from "@/lib/utils";
import { Pacifico } from "next/font/google";

// Menu data structure

const pacifico = Pacifico({
    weight:["400"],
    subsets:["latin"]
  })

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { open } = useSidebar()
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
                    <SidebarMenuButton asChild tooltip={item.title} className="h-14" isActive={item.isActive}>
                      <a href={item.url}>
                        <item.icon strokeWidth={1.5} />
                        <span className="text-lg">{item.title}</span>
                      </a>
                    </SidebarMenuButton>
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
