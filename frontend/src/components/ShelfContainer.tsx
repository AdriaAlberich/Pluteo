import {
  useDroppable,
} from '@dnd-kit/core';
import {
  rectSortingStrategy,
  SortableContext,
} from '@dnd-kit/sortable';
import { useEffect, useRef, useState } from 'react';
import { SortableBook } from './SortableBook';
import { Shelf } from '../context/appStore';
import { Pencil, Trash, Trash2, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useShelves } from '../hooks/useShelves';
import { useLibrary } from '../hooks/useLibrary';

interface ShelfContainerProps {
  shelf: Shelf, 
  totalShelves: number
}

export function ShelfContainer({ shelf, totalShelves }: ShelfContainerProps) {

  // Hook for the shelves system
  const { reOrderShelf, updateShelf, deleteShelf } = useShelves();
  const { getLibraryRefetch } = useLibrary();

  // Translation hooks
  const { t } = useTranslation();

  // Local shelf state
  const [ editMode, setEditMode ] = useState(false);
  const [ safeDelete, setSafeDelete ] = useState(false);
  const [ isOverflowing, setIsOverflowing ] = useState(false);

  // State for the droppable area
  const { setNodeRef } = useDroppable({
    id: shelf.id,
  });

  // Refs for the scrollable area
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollIntervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Handle the window resize event for the scrollable area
  useEffect(() => {
    window.addEventListener('resize', checkOverflow);
    return () => {
      window.removeEventListener('resize', checkOverflow);
    };
  }, []);

  // Check if the scrollable area is overflowing when the books count changes
  useEffect(() => {
    checkOverflow();
  }, [shelf.books.length]);

  // Handle move the shelf up or down (buttons)
  const handleMove = (direction: string) => {
    if (direction === 'up' && shelf.order > 3) {
      reOrderShelf({
        shelfId: shelf.id,
        order: 1,
      }, {
        onSuccess: () => {
          getLibraryRefetch();
        }
      });
    }
    else if (direction === 'down' && shelf.order < totalShelves) {
      reOrderShelf({
        shelfId: shelf.id,
        order: 2,
      }, {
        onSuccess: () => {
          getLibraryRefetch();
        }
      });
    }
  }

  // Handle edit the shelf name (input)
  const handleEdit = () => {
    if (editMode) {
      shelf.name = (document.getElementById('shelfName') as HTMLInputElement).value;
      if (shelf.name === undefined || shelf.name.trim() === '') {
        alert(t('library_shelf_edit_error'));
        return;
      }
      
      updateShelf({
        shelfId: shelf.id,
        shelfName: shelf.name,
      }, {
        onSuccess: () => {
          getLibraryRefetch();
          setEditMode(false);
        }
      });
    }
    else {
      setEditMode(true);
    }
  }

  // Handle delete the shelf (trash icon)
  const handleDelete = () => {
    // Safe delete (double click)
    if (!safeDelete) {
      setSafeDelete(true);
      setTimeout(() => {
        setSafeDelete(false);
      }, 3000);
      return;
    }

    deleteShelf({
      shelfId: shelf.id,
    }, {
      onSuccess: () => {
        getLibraryRefetch();
      },
      onError: () => {
        alert(t('library_shelf_delete_error'));
      }
    });
  }

  // Handle the scroll control (left and right buttons)
  const startScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollIntervalRef.current = setInterval(() => {
        scrollRef.current?.scrollBy({
          left: direction === 'left' ? -10 : 10,
          behavior: 'auto',
        });
      }, 10);
    }
  };

  // Stop the scroll when mouse is released
  const stopScroll = () => {
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }
  };

  // Check if the scrollable area is overflowing
  const checkOverflow = () => {
    if (scrollRef.current) {
      setIsOverflowing(scrollRef.current.scrollWidth > scrollRef.current.clientWidth);
    }
  };

  return (
    <div
      ref={setNodeRef}
      className="flex flex-col bg-gray-800 p-4 rounded shadow-lg mb-4 min-h-[300px] max-h-[300px] overflow-hidden"
    >
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          { editMode ? (
            <input
              id="shelfName"
              name="shelfName"
              type="text"
              className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-700 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder={t('library_shelf_edit_placeholder')}
              defaultValue={shelf.name}
            />
          ) : (
            <h2 className="text-lg font-bold mb-2">{shelf.isDefault ? t('library_shelf_default_title') : shelf.isReadQueue ? t('library_shelf_read_queue_title') : shelf.name}</h2>
          )}
          { !(shelf.isDefault || shelf.isReadQueue) && (
            <button
                  onClick={() => {handleEdit()}}
                  className={'text-white rounded-lg flex items-center justify-center gap-2 hover: bg-blue-600 p-2'}
                >
                  <Pencil/>
            </button>
          )}
        </div>
        { !(shelf.isDefault || shelf.isReadQueue) && (
          <div className="flex gap-2">
            { shelf.order > 3 && (
              <button
                onClick={() => {handleMove('up')}}
                className={'text-white rounded-lg flex items-center justify-center gap-2 hover: bg-yellow-600 p-2'}
              >
                <ArrowUp/>
              </button>
            )}
            { shelf.order < totalShelves && (
              <button
                onClick={() => {handleMove('down')}}
                className={'text-white rounded-lg flex items-center justify-center gap-2 hover: bg-yellow-600 p-2'}
              >
                <ArrowDown/>
              </button>
            )}
            <div className="w-[1px] h-10 bg-gray-500"></div>
            <button
              onClick={() => {handleDelete()}}
              className={`text-white rounded-lg flex items-center justify-center gap-2 p-2 ${ safeDelete ? 'hover: bg-red-800' : 'hover: bg-red-600' }`}
            >
              { safeDelete ? <Trash2/> : <Trash/> }
            </button>
          </div>
        )}
      </div>
      <div className="relative">
        {isOverflowing && (
          <button
            onMouseDown={() => startScroll('left')}
            onMouseUp={stopScroll}
            onMouseLeave={stopScroll}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-gray-500 hover:bg-gray-400 text-white p-3 rounded-full z-10 opacity-70 hover:opacity-100"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}
        <SortableContext
          items={shelf.books.map((book) => `${shelf.id}_${book.id}`)}
          strategy={rectSortingStrategy}
        >
          <div 
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto overflow-y-hidden custom-scrollbar"
          >
            {shelf.books.length > 0 ? (
              shelf.books
              .slice()
              .sort((a, b) => a.order - b.order)
              .map((book) => (
                <SortableBook
                  key={`${shelf.id}_${book.id}`}
                  id={`${shelf.id}_${book.id}`}
                  book={book}
                />
              ))
            ) : (
              <div className="flex items-center justify-center w-full h-full min-h-[220px] text-gray-500 text-sm border-2 border-dashed border-gray-600">
                {t('library_shelf_empty')}
              </div>
            )}
          </div>
        </SortableContext>
        {isOverflowing && (
          <button
            onMouseDown={() => startScroll('right')}
            onMouseUp={stopScroll}
            onMouseLeave={stopScroll}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-500 hover:bg-gray-400 text-white p-3 rounded-full z-10 opacity-70 hover:opacity-100"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>
    </div>
  );
}