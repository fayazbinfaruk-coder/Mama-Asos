import React, { useState, useEffect, useRef } from 'react';

interface CourseData {
  course_name: string;
  section: string;
  schedule: Array<{
    day: string;
    start_time: string;
    end_time: string;
    room: string;
  }>;
}

interface SearchableSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
  type: 'course' | 'section';
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({ 
  value, 
  onChange, 
  options, 
  placeholder,
  type 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter options based on search term
  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset highlighted index when filtered options change
  useEffect(() => {
    setHighlightedIndex(0);
  }, [searchTerm]);

  const handleSelect = (option: string) => {
    onChange(option);
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === 'ArrowDown') {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredOptions[highlightedIndex]) {
          handleSelect(filteredOptions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSearchTerm('');
        break;
    }
  };

  const handleInputClick = () => {
    setIsOpen(true);
    if (value) {
      setSearchTerm('');
    }
  };

  const displayValue = isOpen ? searchTerm : value || '';

  return (
    <div ref={dropdownRef} className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={displayValue}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={handleInputClick}
          onClick={handleInputClick}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full border-2 rounded-lg px-3 sm:px-4 py-2.5 sm:py-2 focus:outline-none transition-all font-semibold text-sm sm:text-base ${
            type === 'course' 
              ? 'border-blue-300 dark:border-blue-600 focus:border-blue-500 dark:focus:border-blue-400 text-blue-900 dark:text-blue-200' 
              : 'border-purple-300 dark:border-purple-600 focus:border-purple-500 dark:focus:border-purple-400 text-purple-900 dark:text-purple-200'
          } ${value ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'} placeholder:text-gray-400 dark:placeholder:text-gray-500 placeholder:font-normal`}
        />
        
        {/* Dropdown Arrow */}
        <div className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <svg 
            className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Selected Indicator */}
        {value && !isOpen && (
          <div className={`absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 w-2 h-2 rounded-full ${
            type === 'course' ? 'bg-blue-500 dark:bg-blue-400' : 'bg-purple-500 dark:bg-purple-400'
          }`} />
        )}
      </div>

      {/* Dropdown List */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg shadow-2xl max-h-60 overflow-y-auto">
          {filteredOptions.length > 0 ? (
            <div className="py-1">
              {filteredOptions.map((option, index) => (
                <div
                  key={option}
                  onClick={() => handleSelect(option)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={`px-3 sm:px-4 py-2.5 sm:py-3 cursor-pointer transition-colors text-sm sm:text-base ${
                    index === highlightedIndex
                      ? type === 'course'
                        ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200'
                        : 'bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-200'
                  } ${value === option ? 'font-bold' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <span>{option}</span>
                    {value === option && (
                      <svg className="w-5 h-5 text-green-500 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
              <div className="text-3xl mb-2">🔍</div>
              <p>No {type === 'course' ? 'courses' : 'sections'} found</p>
              <p className="text-sm mt-1">Try a different search term</p>
            </div>
          )}
        </div>
      )}

      {/* Helper Text */}
      {isOpen && filteredOptions.length > 0 && (
        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 flex items-center space-x-4">
          <span>↑↓ Navigate</span>
          <span>↵ Select</span>
          <span>Esc Close</span>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
