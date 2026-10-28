import React, { useState } from 'react';
import { BookPageData, BulletIconType } from '../data/books';

interface AddChapterModalProps {
  isOpen: boolean;
  onClose: () => void;
  nextPageNumber: number;
  onAddPage: (newPage: BookPageData) => void;
}

export const AddChapterModal: React.FC<AddChapterModalProps> = ({
  isOpen,
  onClose,
  nextPageNumber,
  onAddPage,
}) => {
  const [chapterKicker, setChapterKicker] = useState(`ADHYAY 0${Math.ceil(nextPageNumber / 2)} · NEW CHAPTER`);
  const [title, setTitle] = useState('Aagaz-e-Safar');
  const [highlightText, setHighlightText] = useState('Raat ke barah baje jab purani kitaab ka agla panna khula');
  const [icon, setIcon] = useState<BulletIconType>('feather');
  const [paragraph1, setParagraph1] = useState(
    'Khamosh kamre mein laltain ki लौ (flame) dheere-dheere kaanp rahi thi. Mez par rakhe is naye panne par har lafz aise ubhar raha tha jaise sadiyon se kisi padhne wale ka intezar kar raha ho.'
  );
  const [paragraph2, setParagraph2] = useState(
    'Aap is panne ke kisi bhi kone (corner) ko pakad kar drag karenge toh yeh bilkul asli kitaab ki tarah diagonal fold ke saath paltega.'
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newPage: BookPageData = {
      id: `custom-${Date.now()}`,
      pageNumber: nextPageNumber,
      layout: 'novel-chapter',
      chapterKicker: chapterKicker.trim() || `PAGE ${nextPageNumber}`,
      title: title.trim() || 'Untitled Chapter',
      circlePosition: 'top-right',
      highlights: highlightText.trim()
        ? [
            {
              icon,
              segments: [{ text: highlightText.trim(), bold: true }],
            },
          ]
        : [],
      paragraphs: [paragraph1.trim(), paragraph2.trim()].filter(Boolean),
    };
    onAddPage(newPage);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4">
      <div className="bg-white rounded-lg max-w-lg w-full p-6 shadow-xl border border-[#E5E4DE]">
        <div className="flex items-center justify-between pb-4 border-b border-[#ECEBE5]">
          <h3 className="text-lg font-semibold text-[#0B261C]">
            Add New Novel Page (Page #{nextPageNumber})
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-[#6E7D76] hover:text-[#0B261C] px-2 py-1 cursor-pointer"
          >
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#3A4D44] mb-1">
                Chapter Header
              </label>
              <input
                type="text"
                value={chapterKicker}
                onChange={(e) => setChapterKicker(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#FAF9F5] border border-[#DFDED7] rounded focus:border-[#28B47E] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#3A4D44] mb-1">
                Emerald Line Icon
              </label>
              <select
                value={icon}
                onChange={(e) => setIcon(e.target.value as BulletIconType)}
                className="w-full px-3 py-2 text-xs bg-[#FAF9F5] border border-[#DFDED7] rounded focus:border-[#28B47E] outline-none"
              >
                <option value="feather">Feather Quill</option>
                <option value="book">Open Book</option>
                <option value="lantern">Lantern</option>
                <option value="clock">Pocket Watch</option>
                <option value="train">Express Train</option>
                <option value="compass">Compass</option>
                <option value="key">Antique Key</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#3A4D44] mb-1">
              Chapter Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm font-medium bg-[#FAF9F5] border border-[#DFDED7] rounded focus:border-[#28B47E] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#3A4D44] mb-1">
              Key Story Highlight (Shown next to Emerald Icon)
            </label>
            <input
              type="text"
              value={highlightText}
              onChange={(e) => setHighlightText(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#FAF9F5] border border-[#DFDED7] rounded focus:border-[#28B47E] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#3A4D44] mb-1">
              Opening Paragraph (Includes Automatic Editorial Drop-Cap)
            </label>
            <textarea
              rows={3}
              value={paragraph1}
              onChange={(e) => setParagraph1(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs leading-relaxed bg-[#FAF9F5] border border-[#DFDED7] rounded focus:border-[#28B47E] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#3A4D44] mb-1">
              Second Paragraph
            </label>
            <textarea
              rows={2}
              value={paragraph2}
              onChange={(e) => setParagraph2(e.target.value)}
              className="w-full px-3 py-2 text-xs leading-relaxed bg-[#FAF9F5] border border-[#DFDED7] rounded focus:border-[#28B47E] outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#ECEBE5]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#4A5D54] hover:text-[#0B261C] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium text-white bg-[#0B261C] hover:bg-[#163B2D] rounded transition-colors cursor-pointer"
            >
              Add Page to Flipbook
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
