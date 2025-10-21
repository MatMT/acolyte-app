import { getSession } from "@/lib/auth";

export default async function AcolytePage() {
  const session = await getSession();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Panel de Acólito</h1>
        <p className="mt-4 text-lg text-gray-600">
          ¡Bienvenido, {session?.fullName}!
        </p>
        <p className="mt-2 text-sm text-gray-500">
          Aquí podrás ver tus asignaciones y eventos
        </p>
      </div>
    </main>
  );
}
