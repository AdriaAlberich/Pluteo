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
import { t } from 'i18next';
import { ShelfBookDetails } from './ShelfBookDetails';
import { BookSearch } from './BookSearch';

export function Library() {

  const [ showShelfBook, setShowShelfBook ] = useState(false);
  const [ showSearch, setShowSearch ] = useState(false);
  
  const { 
    library, 
    setLibrary, 
    setSelectedShelfBookShelfId, 
    setSelectedShelfBookId, 
    setSelectedShelfBook,
    filterTerm,
    setFilterTerm,
  } = useAppStore();

  const { getLibrary, getLibraryRefetch } = useLibrary();
  const { reOrderShelfBook, reOrderShelfBookError, moveShelfBook, moveShelfBookError } = useShelfBooks();
  const { createShelf } = useShelves();

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

    console.log('over', over, 'active', active);

    const [draggingFromShelfId, draggingBookId] = String(active.id).split('_');
    const [draggingOverShelfId, overBookId] = String(over.id).split('_');
    console.log('overBookId', overBookId, 'draggingBookId', draggingBookId, 'draggingFromShelfId', draggingFromShelfId, 'draggingOverShelfId', draggingOverShelfId);

    if (draggingFromShelfId === draggingOverShelfId) {
      if(filterTerm === undefined || filterTerm === '' || filterTerm === 'all') {
        // Reorder books within the same shelf
        const shelfIndex = library.shelves.findIndex((shelf) => shelf.id === draggingFromShelfId);
        const fromIndex = library.shelves[shelfIndex].books.findIndex((book) => book.id === draggingBookId);
        const overIndex = library.shelves[shelfIndex].books.findIndex((book) => book.id === overBookId);

        console.log('fromIndex', fromIndex, 'overIndex', overIndex);
        
        // If the book is dropped on itself or the drop target is not found, show the book details
        if (fromIndex === overIndex || overIndex === -1) {
          setSelectedShelfBookShelfId(draggingFromShelfId);
          setSelectedShelfBookId(draggingBookId);
          setShowShelfBook(true);
          return;
        }
        
        // Call reorder here
        reOrderShelfBook({
          shelfId: draggingFromShelfId,
          shelfBookId: draggingBookId,
          order: overIndex+1,
        },
        {
          onSuccess: () => {
            getLibraryRefetch();
          }
        });
      }
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

  const handleCreateShelf = () => {
    const shelfName = (document.getElementById('shelfName') as HTMLInputElement).value;
    (document.getElementById('shelfName') as HTMLInputElement).value = '';
    if (shelfName.trim() === '') {
      alert(t('library_shelf_create_error'));
      return;
    }

    if (library.shelves.some((shelf) => shelf.name === shelfName)) {
      alert(t('library_shelf_create_duplicate_error'));
      return;
    }

    createShelf({
      shelfName,
    }, {
      onSuccess: () => {
        getLibraryRefetch();
      },
      onError: (error) => {
        console.error('Error creating shelf:', error);
      },
    });
  };

  const handleCreateShelfBook = () => {
    setSelectedShelfBookShelfId(undefined);
    setSelectedShelfBookId(undefined);
    setShowShelfBook(true);
  };

  const handleBookDetailsClose = () => {
    setShowShelfBook(false);
    setSelectedShelfBookShelfId(undefined);
    setSelectedShelfBookId(undefined);
    setSelectedShelfBook(undefined);
  }

  const handleSearchClose = () => {
    setShowSearch(false);
  }

  const handleSearch = () => {
    setShowSearch(true);
  }

  return (
    <>
      <div className="flex flex-col h-full w-full p-4 bg-gray-900 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-4 mb-4">
            <button 
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              onClick={() => {handleCreateShelfBook()}}
            >
              {t('library_book_add_button')}
            </button>
            <button 
              className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
              onClick={() => {handleSearch()}}
            >
              {t('library_book_search_button')}
            </button>
          </div>
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              name="filter"
              id="filter"
              placeholder={t('library_book_filter_placeholder')}
              className="appearance-none rounded-lg relative block px-3 py-2 border border-gray-700 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              onChange={(e) => setFilterTerm(e.target.value)}
            />
          </div>
        </div>
        <h2 className="text-xl font-bold mb-4">{t('library_shelves_title')}</h2>
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
              <ShelfContainer 
                key={shelf.id} 
                shelf={shelf} 
                totalShelves={library.shelves.length}
              />
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
        <div className="flex items-center justify-center mb-4 gap-4">
          <input
            type="text"
            name="shelfName"
            id="shelfName"
            placeholder={t('library_shelf_create_placeholder')}
            className="appearance-none rounded-lg relative block px-3 py-2 border border-gray-700 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => {handleCreateShelf()}}
          >
            {t('library_shelf_create_button')}
          </button>
        </div>
      </div>
      {showShelfBook && <ShelfBookDetails onClose={() => handleBookDetailsClose()} />}
      {showSearch && <BookSearch onClose={() => handleSearchClose()} />}
    </>
  );
}