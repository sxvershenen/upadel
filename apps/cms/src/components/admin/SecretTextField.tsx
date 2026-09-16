"use client";
import { FieldLabel, useField } from "@payloadcms/ui";

export function SecretTextField({
  path,
  field,
}: {
  path: string;
  field: { label?: string; required?: boolean };
}) {
  const { value, setValue } = useField<string>({ path });
  return (
    <div className="field-type text">
      <FieldLabel
        htmlFor={`field-${path}`}
        label={field.label}
        required={field.required}
      />
      <input
        id={`field-${path}`}
        type="password"
        autoComplete="new-password"
        value={value ?? ""}
        onChange={(event) => setValue(event.target.value)}
      />
    </div>
  );
}
