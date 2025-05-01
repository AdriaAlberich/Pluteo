import {
  useDroppable,
} from '@dnd-kit/core';
import {
  rectSortingStrategy,
  SortableContext,
} from '@dnd-kit/sortable';
import { useState } from 'react';
import { SortableBook } from './SortableBook';
import { Shelf, ShelfBookPreview } from '../context/appStore';
import { Pencil, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../context/appStore';
import { useShelves } from '../hooks/useShelves';

export function ShelfContainer({ shelf, totalShelves }: { shelf: Shelf, totalShelves: number }) {
  const { library, setLibrary } = useAppStore();
  const { reOrderShelf, updateShelf, deleteShelf } = useShelves();
  const { t } = useTranslation();
  const [ editMode, setEditMode ] = useState(false);

  const { setNodeRef } = useDroppable({
    id: shelf.id,
  });

  const handleMove = (direction: string) => {
    console.log(`Move ${shelf.name} ${direction}`);
    if (direction === 'up' && shelf.order > 3) {
      const newOrder = shelf.order - 1;
      reOrderShelf({
        shelfId: shelf.id,
        order: newOrder,
      }, {
        onSuccess: () => {
          const updatedShelves = library.shelves.map((s) => {
            if (s.id === shelf.id) {
              return { ...s, order: newOrder };
            } else if (s.order === newOrder) {
              return { ...s, order: s.order - 1 };
            }
            return s;
          });
          setLibrary({ ...library, shelves: updatedShelves });
        }
      });
    }
    else if (direction === 'down' && shelf.order < totalShelves) {
      const newOrder = shelf.order + 1;
      reOrderShelf({
        shelfId: shelf.id,
        order: newOrder,
      }, {
        onSuccess: () => {
          const updatedShelves = library.shelves.map((s) => {
            if (s.id === shelf.id) {
              return { ...s, order: newOrder };
            } else if (s.order === newOrder) {
              return { ...s, order: s.order + 1 };
            }
            return s;
          });
          setLibrary({ ...library, shelves: updatedShelves });
        }
      });
    }
  }

  const handleEdit = () => {
    console.log(`Edit ${shelf.name}`);
    if (editMode) {
      if (shelf.name.trim() === '') {
        alert(t('library_shelf_edit_error'));
        return;
      }

      shelf.name = (document.getElementById('shelfName') as HTMLInputElement).value;
      
      updateShelf({
        shelfId: shelf.id,
        shelfName: shelf.name,
      }, {
        onSuccess: () => {
          const updatedShelves = library.shelves.map((s) => {
            if (s.id === shelf.id) {
              return { ...s, name: shelf.name };
            }
            return s;
          });
          setLibrary({ ...library, shelves: updatedShelves });
          setEditMode(false);
        }
      });
    }
    else {
      setEditMode(true);
    }
  }

  const handleDelete = () => {
    console.log(`Delete ${shelf.name}`);
    deleteShelf({
      shelfId: shelf.id,
    }, {
      onSuccess: () => {
        const updatedShelves = library.shelves.filter((s) => s.id !== shelf.id);
        setLibrary({ ...library, shelves: updatedShelves });
      }
    });
  }

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
                  className={'text-white rounded-lg flex items-center justify-center gap-2 hover: bg-gray-700 p-2'}
                >
                  <Pencil/>
            </button>
          )}
        </div>
        { !(shelf.isDefault || shelf.isReadQueue) && (
          <div className="flex gap-2">
            { shelf.order !== 3 && (
              <button
                onClick={() => {handleMove('up')}}
                className={'text-white rounded-lg flex items-center justify-center gap-2 hover: bg-gray-700 p-2'}
              >
                <ArrowUp/>
              </button>
            )}
            { shelf.order === totalShelves && (
              <button
                onClick={() => {handleMove('down')}}
                className={'text-white rounded-lg flex items-center justify-center gap-2 hover: bg-gray-700 p-2'}
              >
                <ArrowDown/>
              </button>
            )}
            <div className="w-[1px] h-10 bg-gray-600"></div>
            <button
              onClick={() => {handleDelete()}}
              className={'text-white rounded-lg flex items-center justify-center gap-2 hover: bg-gray-700 p-2'}
            >
              <Trash2/>
            </button>
          </div>
        )}
      </div>
      <SortableContext
        items={shelf.books.map((book) => `${shelf.id}_${book.id}`)}
        strategy={rectSortingStrategy}
      >
        <div className="flex gap-4 overflow-x-auto">
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
            <div className="flex items-center justify-center w-full h-full min-h-[230px] text-gray-500 text-sm border-2 border-dashed border-gray-600">
              {t('library_shelf_empty')}
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}