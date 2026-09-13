import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useCategories, useHouses } from '@/hooks/use-houses';
import { supabase } from '@/lib/supabase';
import { houseFieldErrors, houseSchema, type HouseFieldErrors } from '@/lib/validations/house';
import type { Category } from '@/types/category';
import type { House } from '@/types/house';
import {
    BathIcon,
    BedDoubleIcon,
    HouseIcon,
    LayoutGridIcon,
    Maximize2Icon,
    PencilIcon,
    SquareIcon,
    StarIcon,
    Trash2Icon,
    TreesIcon,
} from 'lucide-react';
import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { toast } from 'sonner';

const arsFormatter = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
});

const CATEGORY_UI = {
    Tradicionales: { icon: HouseIcon, variant: 'outline' },
    Minimalistas: { icon: SquareIcon, variant: 'secondary' },
    Cabañas: { icon: TreesIcon, variant: 'default' },
} as const;

const HOUSE_FILTERS = [
    { value: 'all', label: 'Todas', icon: LayoutGridIcon },
    { value: 'Tradicionales', label: 'Tradicionales', icon: HouseIcon },
    { value: 'Minimalistas', label: 'Minimalistas', icon: SquareIcon },
    { value: 'Cabañas', label: 'Cabañas', icon: TreesIcon },
] as const;

type HouseFilter = (typeof HOUSE_FILTERS)[number]['value'];
type CategoryName = keyof typeof CATEGORY_UI;

function CategoryBadge({ name }: { name: string | null | undefined }) {
    if (!name) {
        return '—';
    }

    const ui = name in CATEGORY_UI ? CATEGORY_UI[name as CategoryName] : null;
    const Icon = ui?.icon;

    return (
        <Badge variant={ui?.variant ?? 'outline'}>
            {Icon ? <Icon data-icon="inline-start" /> : null}
            {name}
        </Badge>
    );
}

function SpecCell({ icon: Icon, children }: { icon: typeof BedDoubleIcon; children: ReactNode }) {
    return (
        <div className="flex items-center gap-1.5 text-muted-foreground">
            <Icon className="size-3.5" />
            <span className="text-foreground tabular-nums">{children}</span>
        </div>
    );
}

function formatArs(value: string | number) {
    return arsFormatter.format(Number(value));
}

function formatSqm(value: string | number) {
    return `${Number(value)} m²`;
}

const emptyForm = {
    categoryId: '',
    title: '',
    price: '',
    bedrooms: '',
    bathrooms: '',
    coveredSqm: '',
    gallerySqm: '',
    isBestseller: false,
};

export function Houses() {
    const { data: houses, error, isLoading, mutate } = useHouses();
    const { data: categories, error: categoriesError } = useCategories();
    const [filter, setFilter] = useState<HouseFilter>('all');
    const [formHouse, setFormHouse] = useState<House | null>(null);
    const [formOpen, setFormOpen] = useState(false);
    const [houseToDelete, setHouseToDelete] = useState<House | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const filteredHouses =
        filter === 'all'
            ? (houses ?? [])
            : (houses ?? []).filter((house) => house.category?.name === filter);

    function openCreate() {
        setFormHouse(null);
        setFormOpen(true);
    }

    function openEdit(house: House) {
        setFormHouse(house);
        setFormOpen(true);
    }

    async function handleDelete() {
        if (!houseToDelete) {
            return;
        }

        setIsDeleting(true);
        const { error: deleteError } = await supabase
            .from('table_houses')
            .delete()
            .eq('id', houseToDelete.id);
        setIsDeleting(false);

        if (deleteError) {
            toast.error('No se pudo eliminar la casa');
            return;
        }

        toast.success('Casa eliminada');
        setHouseToDelete(null);
        await mutate();
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-semibold">Casas</h1>
                    <p className="text-sm text-muted-foreground">
                        Alta, edición y baja de modelos del catálogo.
                    </p>
                </div>
                <Button onClick={openCreate}>Nueva casa</Button>
            </div>

            <ToggleGroup
                type="single"
                variant="outline"
                value={filter}
                onValueChange={(value) => {
                    if (value) {
                        setFilter(value as HouseFilter);
                    }
                }}
            >
                {HOUSE_FILTERS.map((item) => {
                    const Icon = item.icon;
                    return (
                        <ToggleGroupItem key={item.value} value={item.value}>
                            <Icon data-icon="inline-start" />
                            {item.label}
                        </ToggleGroupItem>
                    );
                })}
            </ToggleGroup>

            {error || categoriesError ? (
                <p className="text-sm text-destructive" role="alert">
                    No se pudieron cargar las casas. Intentá de nuevo.
                </p>
            ) : null}

            {isLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Spinner />
                    Cargando casas...
                </div>
            ) : null}

            {!isLoading && !error && !categoriesError && filteredHouses.length === 0 ? (
                <Empty className="border">
                    <EmptyHeader>
                        <EmptyTitle>No hay casas</EmptyTitle>
                        <EmptyDescription>
                            {filter === 'all'
                                ? 'Todavía no hay casas para mostrar.'
                                : `No hay casas en ${filter}.`}
                        </EmptyDescription>
                    </EmptyHeader>
                </Empty>
            ) : null}

            {!isLoading && filteredHouses.length > 0 ? (
                <div className="overflow-hidden rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Título</TableHead>
                                <TableHead>Categoría</TableHead>
                                <TableHead>Precio</TableHead>
                                <TableHead>Dorm.</TableHead>
                                <TableHead>Baños</TableHead>
                                <TableHead>Cubiertos</TableHead>
                                <TableHead>Galería</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredHouses.map((house) => (
                                <TableRow key={house.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">{house.title}</span>
                                            {house.is_bestseller ? (
                                                <Badge variant="secondary">
                                                    <StarIcon data-icon="inline-start" />
                                                    Más vendida
                                                </Badge>
                                            ) : null}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <CategoryBadge name={house.category?.name} />
                                    </TableCell>
                                    <TableCell className="tabular-nums">
                                        {formatArs(house.price)}
                                    </TableCell>
                                    <TableCell>
                                        <SpecCell icon={BedDoubleIcon}>{house.bedrooms}</SpecCell>
                                    </TableCell>
                                    <TableCell>
                                        <SpecCell icon={BathIcon}>{house.bathrooms}</SpecCell>
                                    </TableCell>
                                    <TableCell>
                                        <SpecCell icon={Maximize2Icon}>
                                            {formatSqm(house.covered_sqm)}
                                        </SpecCell>
                                    </TableCell>
                                    <TableCell>
                                        <SpecCell icon={Maximize2Icon}>
                                            {formatSqm(house.gallery_sqm)}
                                        </SpecCell>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        size="icon-sm"
                                                        aria-label="Editar"
                                                        onClick={() => openEdit(house)}
                                                    >
                                                        <PencilIcon />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>Editar</TooltipContent>
                                            </Tooltip>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="destructive"
                                                        size="icon-sm"
                                                        aria-label="Eliminar"
                                                        onClick={() => setHouseToDelete(house)}
                                                    >
                                                        <Trash2Icon />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>Eliminar</TooltipContent>
                                            </Tooltip>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            ) : null}

            <HouseFormDialog
                open={formOpen}
                house={formHouse}
                categories={categories ?? []}
                onOpenChange={setFormOpen}
                onSaved={mutate}
            />

            <AlertDialog
                open={houseToDelete !== null}
                onOpenChange={(open) => {
                    if (!open && !isDeleting) {
                        setHouseToDelete(null);
                    }
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Eliminar casa</AlertDialogTitle>
                        <AlertDialogDescription>
                            {houseToDelete
                                ? `¿Eliminar ${houseToDelete.title}? Esta acción no se puede deshacer.`
                                : null}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            variant="destructive"
                            disabled={isDeleting}
                            onClick={(event) => {
                                event.preventDefault();
                                void handleDelete();
                            }}
                        >
                            {isDeleting ? <Spinner /> : null}
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

function HouseFormDialog({
    open,
    house,
    categories,
    onOpenChange,
    onSaved,
}: {
    open: boolean;
    house: House | null;
    categories: Category[];
    onOpenChange: (open: boolean) => void;
    onSaved: () => Promise<unknown>;
}) {
    const [categoryId, setCategoryId] = useState(emptyForm.categoryId);
    const [title, setTitle] = useState(emptyForm.title);
    const [price, setPrice] = useState(emptyForm.price);
    const [bedrooms, setBedrooms] = useState(emptyForm.bedrooms);
    const [bathrooms, setBathrooms] = useState(emptyForm.bathrooms);
    const [coveredSqm, setCoveredSqm] = useState(emptyForm.coveredSqm);
    const [gallerySqm, setGallerySqm] = useState(emptyForm.gallerySqm);
    const [isBestseller, setIsBestseller] = useState(emptyForm.isBestseller);
    const [fieldErrors, setFieldErrors] = useState<HouseFieldErrors>({});
    const [saving, setSaving] = useState(false);

    const isEditing = house !== null;

    useEffect(() => {
        if (!open) {
            return;
        }

        setFieldErrors({});
        if (house) {
            setCategoryId(String(house.category_id));
            setTitle(house.title);
            setPrice(String(house.price));
            setBedrooms(String(house.bedrooms));
            setBathrooms(String(house.bathrooms));
            setCoveredSqm(String(house.covered_sqm));
            setGallerySqm(String(house.gallery_sqm));
            setIsBestseller(house.is_bestseller);
            return;
        }

        setCategoryId(emptyForm.categoryId);
        setTitle(emptyForm.title);
        setPrice(emptyForm.price);
        setBedrooms(emptyForm.bedrooms);
        setBathrooms(emptyForm.bathrooms);
        setCoveredSqm(emptyForm.coveredSqm);
        setGallerySqm(emptyForm.gallerySqm);
        setIsBestseller(emptyForm.isBestseller);
    }, [open, house]);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const result = houseSchema.safeParse({
            category_id: categoryId,
            title,
            price,
            bedrooms,
            bathrooms,
            covered_sqm: coveredSqm,
            gallery_sqm: gallerySqm,
            is_bestseller: isBestseller,
        });

        if (!result.success) {
            setFieldErrors(houseFieldErrors(result.error));
            return;
        }

        setFieldErrors({});
        setSaving(true);

        const payload = {
            category_id: result.data.category_id,
            title: result.data.title,
            price: result.data.price,
            bedrooms: result.data.bedrooms,
            bathrooms: result.data.bathrooms,
            covered_sqm: result.data.covered_sqm,
            gallery_sqm: result.data.gallery_sqm,
            is_bestseller: result.data.is_bestseller,
        };

        const { error } = isEditing
            ? await supabase.from('table_houses').update(payload).eq('id', house.id)
            : await supabase.from('table_houses').insert(payload);

        setSaving(false);

        if (error) {
            toast.error(isEditing ? 'No se pudo actualizar la casa' : 'No se pudo crear la casa');
            return;
        }

        toast.success(isEditing ? 'Casa actualizada' : 'Casa creada');
        onOpenChange(false);
        await onSaved();
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
                    <DialogHeader>
                        <DialogTitle>{isEditing ? 'Editar casa' : 'Nueva casa'}</DialogTitle>
                        <DialogDescription>
                            Completá los datos del modelo. Las fotos se cargan después.
                        </DialogDescription>
                    </DialogHeader>

                    <Select value={categoryId || undefined} onValueChange={setCategoryId}>
                        <Field
                            label="Categoría"
                            htmlFor="category_id"
                            error={fieldErrors.category_id}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Elegí una categoría" />
                            </SelectTrigger>
                        </Field>
                        <SelectContent>
                            <SelectGroup>
                                {categories.map((category) => (
                                    <SelectItem key={category.id} value={String(category.id)}>
                                        {category.name}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>

                    <Field label="Título" htmlFor="title" error={fieldErrors.title}>
                        <Input value={title} onChange={(event) => setTitle(event.target.value)} />
                    </Field>

                    <Field label="Precio (ARS)" htmlFor="price" error={fieldErrors.price}>
                        <Input
                            type="number"
                            min="0"
                            step="1"
                            value={price}
                            onChange={(event) => setPrice(event.target.value)}
                        />
                    </Field>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Dormitorios" htmlFor="bedrooms" error={fieldErrors.bedrooms}>
                            <Input
                                type="number"
                                min="0"
                                step="1"
                                value={bedrooms}
                                onChange={(event) => setBedrooms(event.target.value)}
                            />
                        </Field>
                        <Field label="Baños" htmlFor="bathrooms" error={fieldErrors.bathrooms}>
                            <Input
                                type="number"
                                min="0"
                                step="1"
                                value={bathrooms}
                                onChange={(event) => setBathrooms(event.target.value)}
                            />
                        </Field>
                        <Field
                            label="m² cubiertos"
                            htmlFor="covered_sqm"
                            error={fieldErrors.covered_sqm}
                        >
                            <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={coveredSqm}
                                onChange={(event) => setCoveredSqm(event.target.value)}
                            />
                        </Field>
                        <Field
                            label="m² de galería"
                            htmlFor="gallery_sqm"
                            error={fieldErrors.gallery_sqm}
                        >
                            <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={gallerySqm}
                                onChange={(event) => setGallerySqm(event.target.value)}
                            />
                        </Field>
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            id="is_bestseller"
                            type="checkbox"
                            className="size-4"
                            checked={isBestseller}
                            onChange={(event) => setIsBestseller(event.target.checked)}
                        />
                        <Label htmlFor="is_bestseller">Más vendida</Label>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            disabled={saving}
                            onClick={() => onOpenChange(false)}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={saving}>
                            {saving ? <Spinner /> : null}
                            {isEditing ? 'Guardar' : 'Crear'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
