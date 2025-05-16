import { useDraggable, useDroppable } from '@dnd-kit/core';
import { ShelfBookPreview } from '../context/appStore';

interface SortableBookProps {
  id: string;
  book: ShelfBookPreview;
}

export function SortableBook({ id, book }: SortableBookProps) {

  // Hooks for the drag and drop system
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
      className="flex-shrink-0 flex flex-col items-center bg-gray-700 p-4 rounded shadow-lg w-36 h-55"
    >
      <img
        src={book.cover}
        alt={book.title}
        className="w-32 h-40 object-cover mb-2 rounded"
      />
      <span className="text-sm text-center text-white truncate w-full">{book.title}</span>
    </div>
  );
}