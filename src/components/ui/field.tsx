import * as React from 'react';

import { Label } from '@/components/ui/label';

type FieldControlProps = {
    id?: string;
    'aria-invalid'?: boolean;
    'aria-describedby'?: string;
};

function Field({
    label,
    htmlFor,
    error,
    children,
}: {
    label: string;
    htmlFor: string;
    error?: string;
    children: React.ReactElement<FieldControlProps>;
}) {
    const errorId = `${htmlFor}-error`;

    return (
        <div className="flex flex-col gap-1.5">
            <Label htmlFor={htmlFor}>{label}</Label>
            {React.cloneElement(children, {
                id: htmlFor,
                'aria-invalid': Boolean(error) || undefined,
                'aria-describedby': error ? errorId : undefined,
            })}
            {error ? (
                <p id={errorId} className="text-sm text-destructive" role="alert">
                    {error}
                </p>
            ) : null}
        </div>
    );
}

export { Field };
