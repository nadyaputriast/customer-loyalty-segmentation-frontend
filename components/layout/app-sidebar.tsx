"use client"

import * as React from "react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"

import { cn } from "@/lib/utils"
import { NavDocuments } from "@/components/layout/nav-documents"
import { NavMain } from "@/components/layout/nav-main"
import { NavSecondary } from "@/components/layout/nav-secondary"
import { NavUser } from "@/components/layout/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  IconDashboard,
  IconClock,
  IconLayoutGrid,
  IconSparkles,
  IconTicket,
} from "@tabler/icons-react"
import Image from "next/image";

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: (
        <IconDashboard
        />
      ),
    },
    {
      title: "Customer Segments",
      url: "/segments",
      icon: (
        <IconLayoutGrid
        />
      ),
    },
    {
      title: "Promo Campaigns",
      url: "/dashboard/promo-campaigns",
      icon: (
        <IconTicket
        />
      ),
    },
    {
      title: "Inference",
      url: "/inference",
      icon: (
        <IconSparkles
        />
      ),
    },
    {
      title: "Inference History",
      url: "/inference-history",
      icon: (
        <IconClock
        />
      ),
    },
  ],
  navSecondary: [],
  documents: [],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { state } = useSidebar()
  const { user } = useAuth()
  const getOpenState = () => state !== "collapsed"

  const fallbackUser = {
    name: "Guest",
    email: "guest@example.com",
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link href="/dashboard" className="flex items-center gap-2">
                <Image 
                  src="/logo.svg" 
                  alt="loyalT" 
                  width={20} 
                  height={20} 
                  className="h-5 w-5" 
                />
                <h1
                  className={cn(
                    "font-bold font-mono text-2xl whitespace-nowrap transition-[transform,opacity,display] ease-in-out duration-300",
                    !getOpenState()
                      ? "-translate-x-96 opacity-0 hidden"
                      : "translate-x-0 opacity-100"
                  )}
                >
                  loyalT
                </h1>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {data.documents.length > 0 && <NavDocuments items={data.documents} />}
        {data.navSecondary.length > 0 && (
          <NavSecondary items={data.navSecondary} className="mt-auto" />
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user ?? fallbackUser} />
      </SidebarFooter>
    </Sidebar>
  )
}
