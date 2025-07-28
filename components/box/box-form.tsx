"use client";

import type React from "react";

import { useCallback, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Loader2 } from "lucide-react";
import type {
  IntakeBoxRequest,
  DimensionField,
  ValidationError,
} from "@/types/intake";
import {
  StorageLocation,
  StorageLocationListResponse,
} from "@/types/storage-location";

interface BoxFormProps {
  box: IntakeBoxRequest;
  index: number;
  canRemove: boolean;
  validationErrors: ValidationError[];
  locationsData: {
    data: StorageLocationListResponse | undefined;
    isLoading: boolean;
    error: Error | null;
  };
  onUpdateDimension: (
    index: number,
    field: DimensionField,
    value: number,
  ) => void;
  onUpdateWeight: (index: number, value: number) => void;
  onUpdateLocationId: (index: number, value: string) => void;
  onUpdateNotes: (index: number, value: string) => void;
  onRemove: (index: number) => void;
}

export default function BoxForm({
  box,
  index,
  canRemove,
  validationErrors,
  locationsData,
  onUpdateDimension,
  onUpdateWeight,
  onUpdateLocationId,
  onUpdateNotes,
  onRemove,
}: BoxFormProps) {
  const {
    data,
    isLoading: locationsLoading,
    error: locationsError,
  } = locationsData;

  const getFieldError = useCallback(
    (field: string): string | undefined => {
      const error = validationErrors.find(
        (err: ValidationError) => err.boxIndex === index && err.field === field,
      );
      return error?.message;
    },
    [validationErrors, index],
  );

  const handleDimensionChange = useCallback(
    (field: DimensionField) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = Number.parseFloat(event.target.value) || 0;
      onUpdateDimension(index, field, value);
    },
    [index, onUpdateDimension],
  );

  const handleWeightChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = Number.parseFloat(event.target.value) || 0;
      onUpdateWeight(index, value);
    },
    [index, onUpdateWeight],
  );

  const handleNotesChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      onUpdateNotes(index, event.target.value);
    },
    [index, onUpdateNotes],
  );

  const handleRemove = useCallback(() => {
    onRemove(index);
  }, [index, onRemove]);

  const handleLocationSelect = useCallback(
    (value: string) => {
      onUpdateLocationId(index, value);
    },
    [index, onUpdateLocationId],
  );

  const locations = useMemo(() => {
    return data?.locations || [];
  }, [data?.locations]);

  const hasLocationError = useMemo(() => {
    return !!getFieldError("location_id");
  }, [getFieldError]);

  const dimensionFields: Array<{ key: DimensionField; label: string }> =
    useMemo(
      () => [
        { key: "height", label: "Height" },
        { key: "width", label: "Width" },
        { key: "length", label: "Length" },
      ],
      [],
    );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Box {index + 1}</CardTitle>
        {canRemove && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            className="h-8 w-8 p-0"
            aria-label={`Remove box ${index + 1}`}
            type="button"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          {dimensionFields.map(({ key, label }) => {
            const fieldError = getFieldError(key);
            const fieldValue = box.verified_dimensions[key];

            return (
              <div key={key} className="space-y-2">
                <Label htmlFor={`${key}-${index}`}>
                  {label} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id={`${key}-${index}`}
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0"
                  value={fieldValue || ""}
                  onChange={handleDimensionChange(key)}
                  aria-invalid={!!fieldError}
                  aria-describedby={
                    fieldError ? `${key}-${index}-error` : undefined
                  }
                />
                {fieldError && (
                  <p
                    id={`${key}-${index}-error`}
                    className="text-sm text-red-500"
                  >
                    {fieldError}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`weight-${index}`}>
              Weight <span className="text-red-500">*</span>
            </Label>
            <Input
              id={`weight-${index}`}
              type="number"
              min="0"
              step="0.01"
              placeholder="0"
              value={box.weight || ""}
              onChange={handleWeightChange}
              aria-invalid={!!getFieldError("weight")}
              aria-describedby={
                getFieldError("weight") ? `weight-${index}-error` : undefined
              }
            />
            {getFieldError("weight") && (
              <p id={`weight-${index}-error`} className="text-sm text-red-500">
                {getFieldError("weight")}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor={`location-${index}`}>
              Location <span className="text-red-500">*</span>
            </Label>
            {locationsLoading ? (
              <div className="flex items-center gap-2 p-2 border rounded-md">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">
                  Loading locations...
                </span>
              </div>
            ) : locationsError ? (
              <div className="p-2 border border-red-200 rounded-md bg-red-50">
                <span className="text-sm text-red-600">
                  Failed to load locations
                </span>
              </div>
            ) : (
              <Select
                value={box.location_id}
                onValueChange={handleLocationSelect}
              >
                <SelectTrigger
                  className={hasLocationError ? "border-red-500" : ""}
                  aria-invalid={hasLocationError}
                  aria-describedby={
                    hasLocationError ? `location-${index}-error` : undefined
                  }
                >
                  <SelectValue placeholder="Select a location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location: StorageLocation) => (
                    <SelectItem key={location.id} value={location.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{location.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {hasLocationError && (
              <p
                id={`location-${index}-error`}
                className="text-sm text-red-500"
              >
                {getFieldError("location_id")}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`notes-${index}`}>Notes</Label>
          <Textarea
            id={`notes-${index}`}
            placeholder="Optional notes..."
            value={box.notes || ""}
            onChange={handleNotesChange}
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );
}
