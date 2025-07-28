"use client";

import { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Package, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type {
  IntakeBoxRequest,
  IntakeModalProps,
  DimensionField,
  ValidationError,
} from "@/types/intake";
import BoxForm from "@/components/box/box-form";
import { useBatchIntake } from "@/hooks/box/useBatchIntake";
import { useStorageLocations } from "@/hooks/location/useStorageLocations";

export function validateBoxes(boxes: IntakeBoxRequest[]): ValidationError[] {
  const errors: ValidationError[] = [];

  boxes.forEach((box: IntakeBoxRequest, index: number) => {
    // Validate dimensions
    if (box.verified_dimensions.height <= 0) {
      errors.push({
        boxIndex: index,
        field: "height",
        message: "Height must be greater than 0",
      });
    }

    if (box.verified_dimensions.width <= 0) {
      errors.push({
        boxIndex: index,
        field: "width",
        message: "Width must be greater than 0",
      });
    }

    if (box.verified_dimensions.length <= 0) {
      errors.push({
        boxIndex: index,
        field: "length",
        message: "Length must be greater than 0",
      });
    }

    // Validate weight
    if (box.weight <= 0) {
      errors.push({
        boxIndex: index,
        field: "weight",
        message: "Weight must be greater than 0",
      });
    }

    // Validate location ID
    if (!box.location_id.trim()) {
      errors.push({
        boxIndex: index,
        field: "location_id",
        message: "Please select a location",
      });
    }
  });

  return errors;
}

export function createEmptyBox(): IntakeBoxRequest {
  return {
    verified_dimensions: { height: 0, width: 0, length: 0 },
    weight: 0,
    location_id: "",
    notes: "",
  };
}

export default function IntakeModal({
  orderId,
  onSuccess,
  onError,
}: IntakeModalProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [boxes, setBoxes] = useState<IntakeBoxRequest[]>([createEmptyBox()]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
    [],
  );

  const batchIntakeMutation = useBatchIntake();
  const locationsData = useStorageLocations();

  console.log(locationsData.data);
  const addBox = useCallback(() => {
    setBoxes((prevBoxes: IntakeBoxRequest[]) => [
      ...prevBoxes,
      createEmptyBox(),
    ]);
  }, []);

  const removeBox = useCallback((index: number) => {
    setBoxes((prevBoxes: IntakeBoxRequest[]) => {
      if (prevBoxes.length <= 1) return prevBoxes;
      return prevBoxes.filter((_: IntakeBoxRequest, i: number) => i !== index);
    });
    // Clear validation errors for removed box
    setValidationErrors((prevErrors: ValidationError[]) =>
      prevErrors.filter((error: ValidationError) => error.boxIndex !== index),
    );
  }, []);

  const updateBoxDimension = useCallback(
    (index: number, field: DimensionField, value: number) => {
      setBoxes((prevBoxes: IntakeBoxRequest[]) => {
        const updatedBoxes = [...prevBoxes];
        updatedBoxes[index] = {
          ...updatedBoxes[index],
          verified_dimensions: {
            ...updatedBoxes[index].verified_dimensions,
            [field]: value,
          },
        };
        return updatedBoxes;
      });

      // Clear validation error for this field
      setValidationErrors((prevErrors: ValidationError[]) =>
        prevErrors.filter(
          (error: ValidationError) =>
            !(error.boxIndex === index && error.field === field),
        ),
      );
    },
    [],
  );

  const updateBoxWeight = useCallback((index: number, value: number) => {
    setBoxes((prevBoxes: IntakeBoxRequest[]) => {
      const updatedBoxes = [...prevBoxes];
      updatedBoxes[index] = {
        ...updatedBoxes[index],
        weight: value,
      };
      return updatedBoxes;
    });

    // Clear validation error for weight field
    setValidationErrors((prevErrors: ValidationError[]) =>
      prevErrors.filter(
        (error: ValidationError) =>
          !(error.boxIndex === index && error.field === "weight"),
      ),
    );
  }, []);

  const updateBoxLocationId = useCallback((index: number, value: string) => {
    setBoxes((prevBoxes: IntakeBoxRequest[]) => {
      const updatedBoxes = [...prevBoxes];
      updatedBoxes[index] = {
        ...updatedBoxes[index],
        location_id: value,
      };
      return updatedBoxes;
    });

    // Clear validation error for location_id field
    setValidationErrors((prevErrors: ValidationError[]) =>
      prevErrors.filter(
        (error: ValidationError) =>
          !(error.boxIndex === index && error.field === "location_id"),
      ),
    );
  }, []);

  const updateBoxNotes = useCallback((index: number, value: string) => {
    setBoxes((prevBoxes: IntakeBoxRequest[]) => {
      const updatedBoxes = [...prevBoxes];
      updatedBoxes[index] = {
        ...updatedBoxes[index],
        notes: value,
      };
      return updatedBoxes;
    });
  }, []);

  const resetForm = useCallback(() => {
    setBoxes([createEmptyBox()]);
    setValidationErrors([]);
  }, []);

  const handleSubmit = useCallback(async () => {
    const errors = validateBoxes(boxes);

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      await batchIntakeMutation.mutateAsync({
        orderId,
        data: { boxes },
      });

      resetForm();
      setIsOpen(false);
      onSuccess?.();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error : new Error("Unknown error occurred");
      onError?.(errorMessage);
      console.error("Failed to submit intake:", error);
    }
  }, [boxes, batchIntakeMutation, orderId, resetForm, onSuccess, onError]);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      setIsOpen(open);
      if (!open) {
        // Reset form when closing modal
        resetForm();
      }
    },
    [resetForm],
  );

  const hasValidationErrors = useMemo(
    () => validationErrors.length > 0,
    [validationErrors.length],
  );
  const isSubmitting = useMemo(
    () => batchIntakeMutation.isPending,
    [batchIntakeMutation.isPending],
  );
  const canAddBox = useMemo(() => !isSubmitting, [isSubmitting]);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Package className="h-4 w-4" />
          Intake
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Box Intake</DialogTitle>
          <DialogDescription>
            Add box information for intake. You can add multiple boxes at once.
          </DialogDescription>
        </DialogHeader>

        {hasValidationErrors && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please fix the validation errors below before submitting.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          {boxes.map((box: IntakeBoxRequest, index: number) => (
            <BoxForm
              key={index}
              box={box}
              index={index}
              canRemove={boxes.length > 1}
              validationErrors={validationErrors}
              locationsData={locationsData}
              onUpdateDimension={updateBoxDimension}
              onUpdateWeight={updateBoxWeight}
              onUpdateLocationId={updateBoxLocationId}
              onUpdateNotes={updateBoxNotes}
              onRemove={removeBox}
            />
          ))}

          <Button
            variant="outline"
            onClick={addBox}
            className="w-full flex items-center gap-2 bg-transparent"
            disabled={!canAddBox}
            type="button"
          >
            <Plus className="h-4 w-4" />
            Add Another Box
          </Button>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isSubmitting}
            type="button"
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} type="button">
            {isSubmitting ? "Submitting..." : "Submit Intake"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
