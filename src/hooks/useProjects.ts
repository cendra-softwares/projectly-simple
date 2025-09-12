import { useState, useEffect } from "react"
import { Project, ProjectStats } from "@/types/project"

// Mock data for initial development
const mockProjects: Project[] = [
  {
    id: "1",
    name: "E-commerce Platform",
    description: "Building a modern e-commerce platform with React and Node.js",
    status: "in-work",
    contact: {
      name: "John Smith",
      email: "john@example.com",
      phone: "+1 (555) 123-4567",
      address: "123 Main St, New York, NY 10001"
    },
    financials: {
      expenses: 15000,
      profits: 25000
    },
    images: [],
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-02-01")
  },
  {
    id: "2",
    name: "Mobile App Design",
    description: "UI/UX design for a productivity mobile application",
    status: "done",
    contact: {
      name: "Sarah Johnson",
      email: "sarah@designco.com",
      phone: "+1 (555) 987-6543",
      address: "456 Oak Ave, San Francisco, CA 94102"
    },
    financials: {
      expenses: 8000,
      profits: 12000
    },
    images: [],
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-25")
  },
  {
    id: "3",
    name: "Corporate Website",
    description: "Complete website redesign for a financial services company",
    status: "pending",
    contact: {
      name: "Michael Brown",
      email: "m.brown@financorp.com",
      phone: "+1 (555) 456-7890",
      address: "789 Business Blvd, Chicago, IL 60601"
    },
    financials: {
      expenses: 0,
      profits: 18000
    },
    images: [],
    createdAt: new Date("2024-02-10"),
    updatedAt: new Date("2024-02-10")
  },
  {
    id: "4",
    name: "Data Analytics Dashboard",
    description: "Interactive dashboard for real-time business analytics",
    status: "in-work",
    contact: {
      name: "Emily Davis",
      email: "emily@techstartup.io",
      phone: "+1 (555) 321-0987",
      address: "321 Innovation Dr, Austin, TX 73301"
    },
    financials: {
      expenses: 12000,
      profits: 22000
    },
    images: [],
    createdAt: new Date("2024-01-20"),
    updatedAt: new Date("2024-02-05")
  }
]

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>(mockProjects)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const stats: ProjectStats = {
    total: projects.length,
    pending: projects.filter(p => p.status === "pending").length,
    inWork: projects.filter(p => p.status === "in-work").length,
    done: projects.filter(p => p.status === "done").length,
  }

  const addProject = (project: Omit<Project, "id" | "createdAt" | "updatedAt">) => {
    const newProject: Project = {
      ...project,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setProjects(prev => [newProject, ...prev])
  }

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects(prev =>
      prev.map(project =>
        project.id === id
          ? { ...project, ...updates, updatedAt: new Date() }
          : project
      )
    )
  }

  const deleteProject = (id: string) => {
    setProjects(prev => prev.filter(project => project.id !== id))
  }

  const getProject = (id: string) => {
    return projects.find(project => project.id === id)
  }

  return {
    projects,
    stats,
    loading,
    error,
    addProject,
    updateProject,
    deleteProject,
    getProject,
  }
}