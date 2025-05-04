import { useDraggable, useDroppable } from '@dnd-kit/core';
import { ShelfBookPreview } from '../context/appStore';
import { useState } from 'react';

interface SortableBookProps {
  id: string;
  book: ShelfBookPreview;
}

export function SortableBook({ id, book }: SortableBookProps) {
  const { attributes, listeners, setNodeRef: setDraggableRef } = useDraggable({ id });
  const { setNodeRef: setDroppableRef } = useDroppable({ id });

  return (
    <div
      ref={(node) => {
        setDraggableRef(node);
        setDroppableRef(node);
      }}
      {...attributes}
      {...listeners}
      className="flex flex-col items-center bg-gray-700 p-4 rounded shadow-lg"
    >
      <img
        src={book.cover}
        alt={book.title}
        className="w-32 h-48 object-cover mb-2"
      />
      <span className="text-sm text-center">{book.title}</span>
    </div>
  );
}