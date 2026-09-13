import { isRouteErrorResponse, useRouteError } from 'react-router';

export function RouteError() {
    const error = useRouteError();

    const message = isRouteErrorResponse(error)
        ? error.statusText || 'Ocurrió un error'
        : error instanceof Error
          ? error.message
          : 'Ocurrió un error inesperado';

    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-2 p-4 text-center">
            <h1 className="text-xl font-semibold">Algo salió mal</h1>
            <p className="text-sm text-muted-foreground">{message}</p>
        </div>
    );
}
