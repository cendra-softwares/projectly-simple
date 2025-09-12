import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AppSidebar } from "@/components/AppSidebar";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SidebarProvider>
            <div className="flex min-h-screen w-full">
              <AppSidebar />
              <main className="flex-1 flex flex-col">
                <header className="h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center px-6">
                  <SidebarTrigger className="mr-4" />
                  <h1 className="text-lg font-semibold">Project Management Dashboard</h1>
                </header>
                <div className="flex-1 p-6">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/projects" element={<Projects />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </div>
              </main>
            </div>
          </SidebarProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
