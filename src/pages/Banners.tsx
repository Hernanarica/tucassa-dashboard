import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { useBanners } from '@/hooks/use-banners';
import { supabase } from '@/lib/supabase';
import { bannerSaveSchema, type BannerSection } from '@/lib/validations/banner';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const PHOTO_BUCKET = 'banner-photos';
const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);

const SECTIONS = [
    {
        value: 'home',
        label: 'Home',
        description: 'Carrusel de 3 fotos. Tocá una para ponerla primera.',
    },
    { value: 'traditional', label: 'Tradicionales', description: 'Banner de la sección.' },
    { value: 'minimalist', label: 'Minimalistas', description: 'Banner de la sección.' },
    { value: 'cabin', label: 'Cabañas', description: 'Banner de la sección.' },
    { value: 'deliveries', label: 'Entregas', description: 'Banner de la sección.' },
    { value: 'contact', label: 'Contacto', description: 'Banner de la sección.' },
] as const satisfies readonly { value: BannerSection; label: string; description: string }[];

type DraftItem = {
    id: number;
    path: string;
    pendingFile: File | null;
    previewUrl: string | null;
};

type Drafts = Partial<Record<BannerSection, DraftItem[]>>;

function bannerPhotoUrl(path: string) {
    return supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path).data.publicUrl;
}

function photoExtension(file: File) {
    if (file.type === 'image/png') {
        return 'png';
    }

    if (file.type === 'image/webp') {
        return 'webp';
    }

    return 'jpg';
}

function revokeDrafts(drafts: Drafts) {
    for (const items of Object.values(drafts)) {
        for (const item of items ?? []) {
            if (item.previewUrl) {
                URL.revokeObjectURL(item.previewUrl);
            }
        }
    }
}

function BannerSlot({
    item,
    index,
    isHome,
    disabled,
    onPromote,
    onReplace,
}: {
    item: DraftItem;
    index: number;
    isHome: boolean;
    disabled: boolean;
    onPromote: (id: number) => void;
    onReplace: (id: number, files: FileList | null) => void;
}) {
    const src = item.previewUrl ?? bannerPhotoUrl(item.path);
    const isFirst = index === 0;
    const inputId = `banner-${item.id}`;

    return (
        <div className="flex flex-col gap-2">
            <div className="relative">
                <button
                    type="button"
                    disabled={disabled || !isHome || isFirst}
                    className="block w-full overflow-hidden rounded-md border bg-muted disabled:opacity-100"
                    onClick={() => onPromote(item.id)}
                    aria-label={isFirst ? 'Primera' : 'Usar como primera'}
                >
                    <img src={src} alt="" className="aspect-video w-full object-cover" />
                </button>
                {isHome && isFirst ? (
                    <Badge className="absolute top-2 left-2" variant="secondary">
                        Primera
                    </Badge>
                ) : null}
            </div>
            <Label htmlFor={inputId} className="sr-only">
                Reemplazar foto
            </Label>
            <Input
                id={inputId}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                disabled={disabled}
                onChange={(event) => {
                    onReplace(item.id, event.target.files);
                    event.target.value = '';
                }}
            />
        </div>
    );
}

export function Banners() {
    const { data: banners, error, isLoading, mutate } = useBanners();
    const [drafts, setDrafts] = useState<Drafts>({});
    const [savingSection, setSavingSection] = useState<BannerSection | null>(null);

    useEffect(() => {
        if (!banners) {
            return;
        }

        setDrafts((current) => {
            revokeDrafts(current);
            const next: Drafts = {};

            for (const banner of banners) {
                const section = banner.section as BannerSection;
                const items = next[section] ?? [];
                items.push({
                    id: banner.id,
                    path: banner.photo_path,
                    pendingFile: null,
                    previewUrl: null,
                });
                next[section] = items;
            }

            return next;
        });
    }, [banners]);

    function handlePromote(section: BannerSection, id: number) {
        setDrafts((current) => {
            const items = current[section];
            if (!items) {
                return current;
            }

            const index = items.findIndex((item) => item.id === id);
            if (index <= 0) {
                return current;
            }

            const next = [...items];
            const [item] = next.splice(index, 1);
            next.unshift(item);
            return { ...current, [section]: next };
        });
    }

    function handleReplace(section: BannerSection, id: number, fileList: FileList | null) {
        const file = fileList?.[0];
        if (!file) {
            return;
        }

        if (!ALLOWED_PHOTO_TYPES.has(file.type) || file.size > MAX_PHOTO_BYTES) {
            toast.error(`${file.name} no es una imagen PNG, JPEG o WebP de hasta 10 MB`);
            return;
        }

        setDrafts((current) => {
            const items = current[section];
            if (!items) {
                return current;
            }

            return {
                ...current,
                [section]: items.map((item) => {
                    if (item.id !== id) {
                        return item;
                    }

                    if (item.previewUrl) {
                        URL.revokeObjectURL(item.previewUrl);
                    }

                    return {
                        ...item,
                        pendingFile: file,
                        previewUrl: URL.createObjectURL(file),
                    };
                }),
            };
        });
    }

    function isDirty(section: BannerSection) {
        const items = drafts[section];
        const original = (banners ?? []).filter((banner) => banner.section === section);

        if (!items || items.length !== original.length) {
            return false;
        }

        return items.some(
            (item, index) => item.pendingFile !== null || item.id !== original[index]?.id
        );
    }

    async function handleSave(section: BannerSection) {
        const parsed = bannerSaveSchema.safeParse({ section });
        if (!parsed.success) {
            toast.error('Sección inválida');
            return;
        }

        const items = drafts[parsed.data.section];
        if (!items) {
            return;
        }

        const invalidPending = items.some(
            (item) =>
                item.pendingFile !== null &&
                (!ALLOWED_PHOTO_TYPES.has(item.pendingFile.type) ||
                    item.pendingFile.size > MAX_PHOTO_BYTES)
        );

        if (invalidPending) {
            toast.error('Hay fotos inválidas. Usá PNG, JPEG o WebP de hasta 10 MB');
            return;
        }

        setSavingSection(parsed.data.section);

        const uploaded = await Promise.all(
            items.map(async (item) => {
                if (!item.pendingFile) {
                    return item.path;
                }

                const path = `${parsed.data.section}/${crypto.randomUUID()}.${photoExtension(item.pendingFile)}`;
                const { error: uploadError } = await supabase.storage
                    .from(PHOTO_BUCKET)
                    .upload(path, item.pendingFile, { contentType: item.pendingFile.type });

                if (uploadError) {
                    throw uploadError;
                }

                return path;
            })
        ).catch(() => null);

        if (!uploaded) {
            setSavingSection(null);
            toast.error('No se pudieron subir las fotos');
            return;
        }

        if (parsed.data.section === 'home') {
            const staged = await Promise.all(
                items.map((item, index) =>
                    supabase
                        .from('table_banners')
                        .update({ photo_path: uploaded[index], sort_order: 10 + index })
                        .eq('id', item.id)
                )
            );

            if (staged.some((result) => result.error)) {
                setSavingSection(null);
                toast.error('No se pudieron guardar los banners');
                return;
            }

            const ordered = await Promise.all(
                items.map((item, index) =>
                    supabase.from('table_banners').update({ sort_order: index }).eq('id', item.id)
                )
            );

            if (ordered.some((result) => result.error)) {
                setSavingSection(null);
                toast.error('No se pudieron guardar los banners');
                return;
            }
        } else {
            const { error: updateError } = await supabase
                .from('table_banners')
                .update({ photo_path: uploaded[0] })
                .eq('id', items[0].id);

            if (updateError) {
                setSavingSection(null);
                toast.error('No se pudieron guardar los banners');
                return;
            }
        }

        const removedPaths = items.flatMap((item, index) =>
            item.path !== uploaded[index] ? [item.path] : []
        );

        if (removedPaths.length > 0) {
            const { error: removeError } = await supabase.storage
                .from(PHOTO_BUCKET)
                .remove(removedPaths);

            if (removeError) {
                toast.error('Banners guardados, pero no se pudieron borrar algunas fotos viejas');
                setSavingSection(null);
                await mutate();
                return;
            }
        }

        setSavingSection(null);
        toast.success('Banners actualizados');
        await mutate();
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-semibold">Banners</h1>
                <p className="text-sm text-muted-foreground">
                    Cambiá las fotos de cada sección. Los cambios se guardan por bloque.
                </p>
            </div>

            {error ? (
                <p className="text-sm text-destructive" role="alert">
                    No se pudieron cargar los banners. Intentá de nuevo.
                </p>
            ) : null}

            {isLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Spinner />
                    Cargando banners...
                </div>
            ) : null}

            {!isLoading && !error
                ? SECTIONS.map((section) => {
                      const items = drafts[section.value] ?? [];
                      const saving = savingSection === section.value;
                      const dirty = isDirty(section.value);

                      return (
                          <Card key={section.value}>
                              <CardHeader>
                                  <CardTitle>{section.label}</CardTitle>
                                  <CardDescription>{section.description}</CardDescription>
                              </CardHeader>
                              <CardContent>
                                  <div
                                      className={
                                          section.value === 'home'
                                              ? 'grid gap-4 sm:grid-cols-3'
                                              : 'max-w-xl'
                                      }
                                  >
                                      {items.map((item, index) => (
                                          <BannerSlot
                                              key={item.id}
                                              item={item}
                                              index={index}
                                              isHome={section.value === 'home'}
                                              disabled={saving}
                                              onPromote={(id) => handlePromote(section.value, id)}
                                              onReplace={(id, files) =>
                                                  handleReplace(section.value, id, files)
                                              }
                                          />
                                      ))}
                                  </div>
                                  <p className="mt-3 text-xs text-muted-foreground">
                                      PNG, JPEG o WebP. Hasta 10 MB.
                                  </p>
                              </CardContent>
                              <CardFooter>
                                  <Button
                                      type="button"
                                      disabled={saving || !dirty}
                                      onClick={() => {
                                          void handleSave(section.value);
                                      }}
                                  >
                                      {saving ? <Spinner /> : null}
                                      Guardar
                                  </Button>
                              </CardFooter>
                          </Card>
                      );
                  })
                : null}
        </div>
    );
}
