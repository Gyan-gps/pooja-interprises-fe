"use client";

import { useState } from "react";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { SelectField, TextField } from "../../components/ui/FormField";
import type { Order, OrderStatus, StaffMember } from "../../types";

interface MovePhaseModalProps {
  order: Order;
  fromStatus: OrderStatus;
  toStatus: OrderStatus;
  staff: StaffMember[];
  onCancel: () => void;
  onConfirm: (staffName: string, readyCount?: number) => void;
}

export function MovePhaseModal({
  order,
  fromStatus,
  toStatus,
  staff,
  onCancel,
  onConfirm,
}: MovePhaseModalProps) {
  const needsCount = fromStatus === "Binding" && toStatus === "Ready";
  const staffOptions = staff.map(s => ({ value: s.name, label: `${s.name} · ${s.role}` }));

  const [staffName, setStaffName] = useState(
    order.staff !== "—" && staff.some(s => s.name === order.staff) ? order.staff : ""
  );
  const [count, setCount] = useState(String(order.readyCount ?? order.qty));
  const [errors, setErrors] = useState<{ staff?: string; count?: string }>({});

  function handleConfirm() {
    const nextErrors: { staff?: string; count?: string } = {};
    if (!staffName) nextErrors.staff = "Assign a staff member to continue.";

    let readyCount: number | undefined;
    if (needsCount) {
      const parsed = Number(count);
      if (!count.trim() || !Number.isFinite(parsed) || parsed <= 0 || !Number.isInteger(parsed)) {
        nextErrors.count = "Enter a valid piece count (whole number greater than 0).";
      } else {
        readyCount = parsed;
      }
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    onConfirm(staffName, readyCount);
  }

  return (
    <Modal
      title="Confirm phase move"
      subtitle={`${order.orderNumber} · ${order.client}`}
      onClose={onCancel}
      footer={
        <>
          <Button variant="secondary" onClick={onCancel}>Cancel</Button>
          <Button variant="primary" onClick={handleConfirm}>Confirm move</Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-sm">
          <span className="font-semibold text-foreground">{fromStatus}</span>
          <span className="text-muted-foreground mx-2">→</span>
          <span className="font-semibold text-foreground">{toStatus}</span>
        </div>

        <p className="text-xs text-muted-foreground">
          Confirm this status change and assign the staff member responsible for the next phase.
        </p>

        <SelectField
          label="Assign staff member"
          value={staffName}
          options={[{ value: "", label: "Select staff…" }, ...staffOptions]}
          onChange={setStaffName}
          error={errors.staff}
        />

        {needsCount && (
          <TextField
            label="Ready count (pieces)"
            type="number"
            value={count}
            onChange={setCount}
            placeholder={`Ordered qty: ${order.qty}`}
            error={errors.count}
          />
        )}
      </div>
    </Modal>
  );
}
