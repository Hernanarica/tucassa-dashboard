import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty';
import { Spinner } from '@/components/ui/spinner';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useCategories } from '@/hooks/use-houses';

export function Categories() {
    const { data: categories, error, isLoading } = useCategories();

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-semibold">Categorías</h1>
                <p className="text-sm text-muted-foreground">
                    Listado de solo lectura. El tipo de cada casa se elige desde Casas.
                </p>
            </div>

            {error ? (
                <p className="text-sm text-destructive" role="alert">
                    No se pudieron cargar las categorías. Intentá de nuevo.
                </p>
            ) : null}

            {isLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Spinner />
                    Cargando categorías...
                </div>
            ) : null}

            {!isLoading && !error && (categories?.length ?? 0) === 0 ? (
                <Empty className="border">
                    <EmptyHeader>
                        <EmptyTitle>No hay categorías</EmptyTitle>
                        <EmptyDescription>Todavía no hay categorías para mostrar.</EmptyDescription>
                    </EmptyHeader>
                </Empty>
            ) : null}

            {!isLoading && categories && categories.length > 0 ? (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nombre</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {categories.map((category) => (
                            <TableRow key={category.id}>
                                <TableCell className="font-medium">{category.name}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : null}
        </div>
    );
}
