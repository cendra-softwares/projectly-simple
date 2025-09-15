import { BarChart3, FolderOpen, Home, Plus, Settings, LogOut, PieChart } from "lucide-react"
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
import { useAuth } from "@/hooks/useAuth"
import { useIsMobile } from "@/hooks/use-mobile" // Import useIsMobile

const navigationItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Projects", url: "/projects", icon: FolderOpen },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Reports", url: "/reports", icon: PieChart },
  { title: "Settings", url: "/settings", icon: Settings },
]

export function AppSidebar() {
  const { state, openMobile, isMobile } = useSidebar()
  const location = useLocation()
  const currentPath = location.pathname
  // isCollapsed refers to the visual state of the sidebar on desktop (icon-only or full width)
  // On mobile, the sidebar is either open (full width, in a sheet) or closed (hidden)
  const isCollapsed = isMobile ? !openMobile : state === "collapsed"
  const { signOut, user, loading } = useAuth()

  const handleLogout = async () => {
    await signOut()
  }

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
    // The Sidebar component itself handles its responsiveness internally based on `isMobile`
    // We only need to control its `state` prop for desktop (expanded/collapsed)
    // For mobile, the `Sheet` component within Sidebar handles visibility via `openMobile`
    <Sidebar className={`transition-all duration-300 ${!isMobile && isCollapsed ? "w-16" : "w-64"} border-r`}>
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
            <FolderOpen className="h-4 w-4 text-white" />
          </div>
          {/* Only show text content if not collapsed on desktop OR if on mobile and open */}
          {(!isCollapsed || (isMobile && openMobile)) && (
            <div className="flex flex-col">
              <h2 className="text-sm font-semibold">ProjectFlow</h2>
              <p className="text-xs text-muted-foreground">Project Manager</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarGroup>
          {/* Hide label on desktop when collapsed, always show on mobile if open */}
          <SidebarGroupLabel className={!isMobile && isCollapsed ? "sr-only" : ""}>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavClassName(item.url)}>
                      <item.icon className="h-4 w-4 mr-3 flex-shrink-0" />
                      {/* Only show text content if not collapsed on desktop OR if on mobile and open */}
                      {(!isCollapsed || (isMobile && openMobile)) && <span className="text-sm">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

      </SidebarContent>

      <div className="p-4 border-t mt-auto">
        {user && (
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start text-red-500 hover:bg-red-100 dark:hover:bg-red-900"
            disabled={loading}
          >
            <LogOut className="h-4 w-4 mr-3 flex-shrink-0" />
            {/* Only show text content if not collapsed on desktop OR if on mobile and open */}
            {(!isCollapsed || (isMobile && openMobile)) && <span className="text-sm">{loading ? "Logging out..." : "Logout"}</span>}
          </Button>
        )}
        <div className="flex items-center justify-between mt-2">
          {/* Only show text content if not collapsed on desktop OR if on mobile and open */}
          {(!isCollapsed || (isMobile && openMobile)) && <span className="text-xs text-muted-foreground">Theme</span>}
          <ThemeToggle />
        </div>
      </div>
    </Sidebar>
  )
}