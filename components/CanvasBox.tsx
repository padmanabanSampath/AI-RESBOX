import React, { useRef } from 'react';
import { generateImageForPart } from '../services/geminiService';
import { BoxContent } from '../types';
import Loader from './Loader';
import CheckIcon from './icons/CheckIcon';
import ClearIcon from './icons/ClearIcon';

interface CanvasBoxProps {
  boxContent: BoxContent;
  onContentUpdate: (update: Partial<BoxContent>) => void;
  prefetchedImages: Map<string, string>;
}

const CanvasBox: React.FC<CanvasBoxProps> = ({ boxContent, onContentUpdate, prefetchedImages }) => {
  const { inputText, content, isLetter, isLoading } = boxContent;
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!content) {
      onContentUpdate({ inputText: e.target.value });
    }
  };

  const handleBlur = () => {
    const trimmedInput = inputText.trim().toUpperCase();
    if (trimmedInput.length === 1) {
      // Auto-confirm single letters on blur
      onContentUpdate({ content: trimmedInput, isLetter: true, inputText: trimmedInput });
    }
  };

  const handleConfirm = async () => {
    const trimmedInput = inputText.trim().toUpperCase();
    if (trimmedInput.length <= 1) return;

    const cachedImage = prefetchedImages.get(trimmedInput);
    if (cachedImage) {
      onContentUpdate({ content: cachedImage, isLetter: false, isLoading: false, inputText: trimmedInput });
    } else {
      onContentUpdate({ isLoading: true });
      try {
        const imageUrl = await generateImageForPart(trimmedInput);
        onContentUpdate({ content: imageUrl, isLetter: false, isLoading: false, inputText: trimmedInput });
      } catch (error) {
        console.error("Failed to generate image from text", error);
        onContentUpdate({ isLoading: false }); // Reset loading on error
      }
    }
  };
  
  const handleClearInput = () => {
      onContentUpdate({ inputText: '' });
  };

  const handleEdit = () => {
    // This function clears the confirmed content to allow editing.
    onContentUpdate({ inputText: '', content: null, isLetter: false });
    setTimeout(() => {
        inputRef.current?.focus();
    }, 0);
  };

  // Define visibility for action buttons
  const showConfirmButton = inputText.trim().length > 1 && !content && !isLoading;
  const showClearButton = !!inputText && !content && !isLoading;

  const boxStateClasses = content 
    ? 'border-solid border-indigo-500' 
    : 'border-dashed border-gray-600';

  return (
    <div className={`relative w-32 h-32 sm:w-36 sm:h-36 lg:w-40 lg:h-40 rounded-lg bg-white/5 border-2 ${boxStateClasses} flex items-center justify-center overflow-hidden transition-all duration-300 p-2`}>
      {isLoading ? (
        <Loader message="" />
      ) : content ? (
        <div
            className="w-full h-full flex items-center justify-center cursor-pointer"
            onClick={handleEdit}
            aria-label={`Content: ${isLetter ? content : inputText}. Click to edit.`}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleEdit(); }}
        >
          {isLetter ? (
            <span className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white select-none animate-pop-in">{content}</span>
          ) : (
            <img src={content} alt={`Generated image for "${inputText}"`} className="w-full h-full object-contain animate-pop-in" />
          )}
        </div>
      ) : (
        <input
          ref={inputRef}
          type="text"
          value={inputText}
          onChange={handleInputChange}
          onBlur={handleBlur}
          onKeyDown={(e) => { if (e.key === 'Enter') showConfirmButton && handleConfirm(); }}
          placeholder="Type here..."
          className="w-full bg-transparent text-white text-center text-xl outline-none placeholder-gray-500"
        />
      )}

      {/* Action buttons container */}
      {!isLoading && (
        <div className="absolute top-1 right-1 flex flex-col gap-1">
          {showConfirmButton && (
            <button
              onClick={handleConfirm}
              className="p-1.5 bg-green-500/80 rounded-full hover:bg-green-500 transition-colors"
              aria-label="Confirm Word"
            >
              <CheckIcon />
            </button>
          )}
          {showClearButton && (
            <button
              onClick={handleClearInput}
              className="p-1.5 bg-red-500/80 rounded-full hover:bg-red-500 transition-colors"
              aria-label="Clear Input"
            >
              <ClearIcon />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CanvasBox;