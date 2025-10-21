"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Assignment {
  assignment_id: number;
  event: {
    event_id: number;
    title: string;
    type: string;
    description: string | null;
    event_datetime: string;
  };
  status: string;
  attendance_status: string | null;
}

export default function MyAssignmentsPage() {
  const router = useRouter();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const response = await fetch("/api/acolyte/assignments");
      if (!response.ok) {
        throw new Error("Error al cargar asignaciones");
      }
      const data = await response.json();
      setAssignments(data.assignments);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      asignado: "bg-blue-100 text-blue-800",
      rechazado: "bg-red-100 text-red-800",
      reemplazo_propuesto: "bg-yellow-100 text-yellow-800",
      reemplazo_aceptado: "bg-green-100 text-green-800",
      reemplazo_declinado: "bg-gray-100 text-gray-800",
      asistencia_marcada: "bg-purple-100 text-purple-800",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Cargando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Mis Asignaciones</h1>

      {assignments.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-600">No tienes asignaciones pendientes</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {assignments.map((assignment) => (
            <div
              key={assignment.assignment_id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold mb-2">
                    {assignment.event.title}
                  </h2>
                  <p className="text-gray-600 text-sm">
                    {formatDate(assignment.event.event_datetime)}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                    assignment.status
                  )}`}
                >
                  {assignment.status.replace(/_/g, " ")}
                </span>
              </div>

              {assignment.event.description && (
                <p className="text-gray-700 mb-4">
                  {assignment.event.description}
                </p>
              )}

              <div className="flex gap-2 text-sm">
                <span className="bg-gray-100 px-3 py-1 rounded">
                  {assignment.event.type}
                </span>
                {assignment.attendance_status && (
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded">
                    Asistencia: {assignment.attendance_status}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
