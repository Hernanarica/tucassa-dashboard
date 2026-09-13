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
    XIcon,
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

function housePhotoUrl(path: string) {
    return supabase.storage.from('house-photos').getPublicUrl(path).data.publicUrl;
}

function HouseThumb({ house }: { house: House }) {
    const path = house.photo_paths[0];

    if (!path) {
        return (
            <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                <HouseIcon className="size-4" />
            </div>
        );
    }

    return (
        <img
            src={housePhotoUrl(path)}
            alt={house.title}
            className="size-10 shrink-0 rounded-md object-cover"
        />
    );
}

const PHOTO_BUCKET = 'house-photos';
const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);

type ExistingPhoto = { key: string; kind: 'existing'; path: string };
type PendingPhoto = { key: string; kind: 'pending'; file: File; previewUrl: string };
type GalleryItem = ExistingPhoto | PendingPhoto;

function photoExtension(file: File) {
    if (file.type === 'image/png') {
        return 'png';
    }

    if (file.type === 'image/webp') {
        return 'webp';
    }

    return 'jpg';
}

function revokePendingUrls(items: GalleryItem[]) {
    for (const item of items) {
        if (item.kind === 'pending') {
            URL.revokeObjectURL(item.previewUrl);
        }
    }
}

function GalleryGrid({
    items,
    disabled,
    onPromote,
    onRemove,
}: {
    items: GalleryItem[];
    disabled: boolean;
    onPromote: (key: string) => void;
    onRemove: (key: string) => void;
}) {
    if (items.length === 0) {
        return <p className="text-sm text-muted-foreground">Todavía no hay fotos en la galería.</p>;
    }

    return (
        <div className="grid grid-cols-3 gap-2">
            {items.map((item, index) => {
                const src = item.kind === 'existing' ? housePhotoUrl(item.path) : item.previewUrl;
                const isCover = index === 0;

                return (
                    <div key={item.key} className="relative">
                        <button
                            type="button"
                            disabled={disabled || isCover}
                            className="block w-full overflow-hidden rounded-md border bg-muted disabled:opacity-100"
                            onClick={() => onPromote(item.key)}
                            aria-label={isCover ? 'Portada' : 'Usar como portada'}
                        >
                            <img src={src} alt="" className="aspect-square w-full object-cover" />
                        </button>
                        {isCover ? (
                            <Badge className="absolute top-1 left-1" variant="secondary">
                                Portada
                            </Badge>
                        ) : null}
                        <Button
                            type="button"
                            variant="destructive"
                            size="icon-xs"
                            className="absolute top-1 right-1"
                            disabled={disabled}
                            aria-label="Quitar foto"
                            onClick={() => onRemove(item.key)}
                        >
                            <XIcon />
                        </Button>
                    </div>
                );
            })}
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
        const photoPaths = houseToDelete.photo_paths;
        const { error: deleteError } = await supabase
            .from('table_houses')
            .delete()
            .eq('id', houseToDelete.id);

        if (deleteError) {
            setIsDeleting(false);
            toast.error('No se pudo eliminar la casa');
            return;
        }

        if (photoPaths.length > 0) {
            const { error: storageError } = await supabase.storage
                .from(PHOTO_BUCKET)
                .remove(photoPaths);

            if (storageError) {
                toast.error('Casa eliminada, pero no se pudieron borrar algunas fotos');
                setIsDeleting(false);
                setHouseToDelete(null);
                await mutate();
                return;
            }
        }

        setIsDeleting(false);
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
                                            <HouseThumb house={house} />
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
    const [gallery, setGallery] = useState<GalleryItem[]>([]);
    const [createdId, setCreatedId] = useState<number | null>(null);
    const [droppedPaths, setDroppedPaths] = useState<string[]>([]);
    const [fieldErrors, setFieldErrors] = useState<HouseFieldErrors>({});
    const [saving, setSaving] = useState(false);

    const isEditing = house !== null || createdId !== null;

    useEffect(() => {
        if (!open) {
            return;
        }

        setFieldErrors({});
        setCreatedId(null);
        setDroppedPaths([]);
        setGallery((current) => {
            revokePendingUrls(current);
            return (house?.photo_paths ?? []).map((path) => ({
                key: path,
                kind: 'existing' as const,
                path,
            }));
        });

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

    function handleAddPhotos(fileList: FileList | null) {
        if (!fileList) {
            return;
        }

        const accepted: PendingPhoto[] = [];

        for (const file of fileList) {
            if (!ALLOWED_PHOTO_TYPES.has(file.type) || file.size > MAX_PHOTO_BYTES) {
                toast.error(`${file.name} no es una imagen PNG, JPEG o WebP de hasta 10 MB`);
                continue;
            }

            accepted.push({
                key: crypto.randomUUID(),
                kind: 'pending',
                file,
                previewUrl: URL.createObjectURL(file),
            });
        }

        if (accepted.length === 0) {
            return;
        }

        setGallery((current) => [...current, ...accepted]);
    }

    function handlePromotePhoto(key: string) {
        setGallery((current) => {
            const index = current.findIndex((item) => item.key === key);
            if (index <= 0) {
                return current;
            }

            const next = [...current];
            const [item] = next.splice(index, 1);
            next.unshift(item);
            return next;
        });
    }

    function handleRemovePhoto(key: string) {
        const item = gallery.find((entry) => entry.key === key);

        if (!item) {
            return;
        }

        if (item.kind === 'pending') {
            URL.revokeObjectURL(item.previewUrl);
        } else {
            setDroppedPaths((paths) => [...paths, item.path]);
        }

        setGallery((current) => current.filter((entry) => entry.key !== key));
    }

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

        const invalidPending = gallery.some(
            (item) =>
                item.kind === 'pending' &&
                (!ALLOWED_PHOTO_TYPES.has(item.file.type) || item.file.size > MAX_PHOTO_BYTES)
        );

        if (invalidPending) {
            toast.error('Hay fotos inválidas. Usá PNG, JPEG o WebP de hasta 10 MB');
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

        let houseId = house?.id ?? createdId;

        if (houseId === null) {
            const { data, error: insertError } = await supabase
                .from('table_houses')
                .insert(payload)
                .select('id')
                .single();

            if (insertError || !data) {
                setSaving(false);
                toast.error('No se pudo crear la casa');
                return;
            }

            houseId = data.id;
            setCreatedId(data.id);
        } else {
            const { error: updateError } = await supabase
                .from('table_houses')
                .update(payload)
                .eq('id', houseId);

            if (updateError) {
                setSaving(false);
                toast.error('No se pudo actualizar la casa');
                return;
            }
        }

        const uploaded = await Promise.all(
            gallery.map(async (item) => {
                if (item.kind === 'existing') {
                    return item.path;
                }

                const path = `${houseId}/${crypto.randomUUID()}.${photoExtension(item.file)}`;
                const { error: uploadError } = await supabase.storage
                    .from(PHOTO_BUCKET)
                    .upload(path, item.file, { contentType: item.file.type });

                if (uploadError) {
                    throw uploadError;
                }

                return path;
            })
        ).catch(() => null);

        if (!uploaded) {
            setSaving(false);
            toast.error('No se pudieron subir las fotos');
            return;
        }

        const { error: pathsError } = await supabase
            .from('table_houses')
            .update({ photo_paths: uploaded })
            .eq('id', houseId);

        if (pathsError) {
            setSaving(false);
            toast.error('No se pudo guardar la galería');
            return;
        }

        if (droppedPaths.length > 0) {
            const { error: removeError } = await supabase.storage
                .from(PHOTO_BUCKET)
                .remove(droppedPaths);

            if (removeError) {
                toast.error('Casa guardada, pero no se pudieron borrar algunas fotos viejas');
                setSaving(false);
                onOpenChange(false);
                await onSaved();
                return;
            }
        }

        setSaving(false);
        toast.success(isEditing && house !== null ? 'Casa actualizada' : 'Casa creada');
        onOpenChange(false);
        await onSaved();
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
                <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
                    <DialogHeader>
                        <DialogTitle>{house !== null ? 'Editar casa' : 'Nueva casa'}</DialogTitle>
                        <DialogDescription>
                            Completá los datos del modelo. La primera foto es la portada del
                            listado.
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

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="photos">Fotos</Label>
                        <GalleryGrid
                            items={gallery}
                            disabled={saving}
                            onPromote={handlePromotePhoto}
                            onRemove={handleRemovePhoto}
                        />
                        <Input
                            id="photos"
                            type="file"
                            multiple
                            accept="image/png,image/jpeg,image/webp"
                            disabled={saving}
                            onChange={(event) => {
                                handleAddPhotos(event.target.files);
                                event.target.value = '';
                            }}
                        />
                        <p className="text-xs text-muted-foreground">
                            PNG, JPEG o WebP. Hasta 10 MB. Tocá una foto para usarla de portada.
                        </p>
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
