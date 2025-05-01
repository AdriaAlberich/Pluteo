import { useState } from 'react';

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
} from '@dnd-kit/sortable';

import { ShelfContainer } from './ShelfContainer';
import { LibraryOverview, Shelf, ShelfBookPreview, ShelfBook, useAppStore } from '../context/appStore';
import { useLibrary } from '../hooks/useLibrary';
import { useShelfBooks } from '../hooks/useShelfBooks';
import { useShelves } from '../hooks/useShelves';

export function Library() {
  const { library, setLibrary } = useAppStore();
  const { getLibrary } = useLibrary();
  const { reOrderShelfBook, reOrderShelfBookError, moveShelfBook, moveShelfBookError } = useShelfBooks();
  const { reOrderShelf } = useShelves();

  const [draggingBook, setDraggingBook] = useState<ShelfBookPreview | null>(null);
  const sensors = useSensors(useSensor(PointerSensor));

  const onDragStart = ({ active }: { active: any }) => {
    const [shelfId, bookId] = active.id.split('_');
    const shelf = library.shelves.find((shelf) => shelf.id === shelfId);
    const bookPreview = shelf?.books.find((book) => book.id === bookId);
    setDraggingBook(bookPreview || null);
  };

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    setDraggingBook(null);

    if (!over) return;

    const [draggingFromShelfId, draggingBookId] = String(active.id).split('_');
    const [draggingOverShelfId, overBookId] = String(over.id).split('_');
    console.log('overBookId', overBookId, 'draggingBookId', draggingBookId, 'draggingFromShelfId', draggingFromShelfId, 'draggingOverShelfId', draggingOverShelfId);

    if (draggingFromShelfId === draggingOverShelfId) {
      // Reorder books within the same shelf
      const shelfIndex = library.shelves.findIndex((shelf) => shelf.id === draggingFromShelfId);
      const fromIndex = library.shelves[shelfIndex].books.findIndex((book) => book.id === draggingBookId);
      const overIndex = library.shelves[shelfIndex].books.findIndex((book) => book.id === overBookId);
      const updatedBooks = arrayMove(
        library.shelves[shelfIndex].books,
        fromIndex,
        overIndex
      );
      
      // Call reorder here
      reOrderShelfBook({
        shelfId: draggingFromShelfId,
        shelfBookId: draggingBookId,
        order: overIndex,
      },
      {
        onSuccess: () => {
          library.shelves[shelfIndex].books = updatedBooks;
          setLibrary(library);
        }
      });
    } else {
      // Move book to a different shelf
      const sourceShelfIndex = library.shelves.findIndex((shelf) => shelf.id === draggingFromShelfId);
      const destinationShelfIndex = library.shelves.findIndex((shelf) => shelf.id === draggingOverShelfId);

      const sourceBooks = [...library.shelves[sourceShelfIndex].books];
      const [movedBook] = sourceBooks.splice(
        sourceBooks.findIndex((book) => book.id === draggingBookId),
        1
      );

      console.log('movedBook', movedBook, 'sourceBooks', sourceBooks, 'destinationShelfIndex', destinationShelfIndex);

      const destinationBooks = [...library.shelves[destinationShelfIndex].books];
      destinationBooks.push(movedBook);

      const updatedShelves = [...library.shelves];
      updatedShelves[sourceShelfIndex].books = sourceBooks;
      updatedShelves[destinationShelfIndex].books = destinationBooks;

      // Call move here
      moveShelfBook({
        shelfId: draggingFromShelfId,
        shelfBookId: draggingBookId,
        destinationShelfId: draggingOverShelfId,
      },
      {
        onSuccess: () => {
          library.shelves = updatedShelves;
          setLibrary(library);
        },
      });
    }
  };

  return (
    <div className="flex flex-col h-full w-full p-4 bg-gray-900 text-white">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        <div className="flex flex-col gap-4 overflow-y-auto h-full">
        {library.shelves
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((shelf) => (
            <ShelfContainer key={shelf.id} shelf={shelf} totalShelves={library.shelves.length+1} />
        ))}
        </div>

        <DragOverlay>
          {draggingBook ? (
            <div className="flex flex-col items-center bg-gray-700 p-4 rounded shadow-lg">
              <img
                src={draggingBook.cover}
                alt={draggingBook.title}
                className="w-32 h-48 object-cover mb-2"
              />
              <span className="text-sm text-center">{draggingBook.title}</span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}