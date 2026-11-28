import { useState } from "react";
import { reorderList } from "../grades";

export type DropPosition = 'before' | 'after' | null;

export function useDragReorder<T>(
    items: T[],
    onReorder: (newItems: T[]) => void
) {
    const [dragIndex, setDragIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

    const handleDrop = (toIndex: number) => {
        if (dragIndex !== null && dragIndex !== toIndex) {
            onReorder(reorderList(items, dragIndex, toIndex));
        }
        setDragIndex(null);
        setDragOverIndex(null);
    };

    // Helper that returns all drag state & event handlers for a given index
    const getItemProps = (index: number) => {
        const isDragging = dragIndex === index;
        const dropPosition: DropPosition =
            dragOverIndex === index && dragIndex !== null && dragIndex !== index
                ? dragIndex > index
                    ? 'before' // dragging up / left
                    : 'after'  // dragging down / right
                : null;
        return {
            isDragging,
            dropPosition,
            onDragStart: () => setDragIndex(index),
            onDragOver: (e: React.DragEvent) => {
                e.preventDefault();
                setDragOverIndex(index);
            },
            onDrop: () => handleDrop(index),
            onDragEnd: () => {
                setDragIndex(null);
                setDragOverIndex(null);
            },
        };
    };

    return { getItemProps };
}