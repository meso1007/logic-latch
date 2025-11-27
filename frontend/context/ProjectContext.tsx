"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081";

interface ProjectSummary {
    id: number;
    goal: string;
    created_at: string;
}

interface ProjectContextType {
    projects: ProjectSummary[];
    isLoading: boolean;
    fetchProjects: () => Promise<void>;
    deleteProject: (id: number) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
    const [projects, setProjects] = useState<ProjectSummary[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { token } = useAuth();

    const fetchProjects = useCallback(async () => {
        if (!token) {
            setProjects([]);
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/projects`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                const data = await response.json();
                setProjects(data);
            }
        } catch (error) {
            console.error("Failed to fetch projects:", error);
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    const deleteProject = async (id: number) => {
        if (!token) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/projects/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                setProjects((prev) => prev.filter((p) => p.id !== id));
            } else {
                console.error("Failed to delete project");
            }
        } catch (error) {
            console.error("Error deleting project:", error);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    return (
        <ProjectContext.Provider value={{ projects, isLoading, fetchProjects, deleteProject }}>
            {children}
        </ProjectContext.Provider>
    );
}

export function useProjects() {
    const context = useContext(ProjectContext);
    if (context === undefined) {
        throw new Error("useProjects must be used within a ProjectProvider");
    }
    return context;
}
