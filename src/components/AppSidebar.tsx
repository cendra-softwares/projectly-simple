import { useState } from "react"
import { BarChart3, FolderOpen, Home, Plus, Settings } from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "./ThemeToggle"

const navigationItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Projects", url: "/projects", icon: FolderOpen },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Settings", url: "/settings", icon: Settings },
]

export function AppSidebar() {
  const { state } = useSidebar()
  const location = useLocation()
  const currentPath = location.pathname
  const isCollapsed = state === "collapsed"

  const isActive = (path: string) => {
    if (path === "/") {
      return currentPath === "/"
    }
    return currentPath.startsWith(path)
  }

  const getNavClassName = (path: string) => {
    const active = isActive(path)
    return `w-full justify-start transition-colors ${
      active 
        ? "bg-primary/10 text-primary border-r-2 border-primary" 
        : "hover:bg-accent text-muted-foreground hover:text-foreground"
    }`
  }

  return (
    <Sidebar className={`transition-all duration-300 ${isCollapsed ? "w-16" : "w-64"} border-r`}>
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
            <FolderOpen className="h-4 w-4 text-white" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <h2 className="text-sm font-semibold">ProjectFlow</h2>
              <p className="text-xs text-muted-foreground">Project Manager</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupLabel className={isCollapsed ? "sr-only" : ""}>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavClassName(item.url)}>
                      <item.icon className="h-4 w-4 mr-3 flex-shrink-0" />
                      {!isCollapsed && <span className="text-sm">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {!isCollapsed && (
          <SidebarGroup className="mt-4">
            <SidebarGroupContent>
              <Button className="w-full justify-start gradient-primary text-white hover:opacity-90 transition-opacity">
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Button>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <div className="p-4 border-t mt-auto">
        <div className="flex items-center justify-between">
          {!isCollapsed && <span className="text-xs text-muted-foreground">Theme</span>}
          <ThemeToggle />
        </div>
      </div>
    </Sidebar>
  )
}