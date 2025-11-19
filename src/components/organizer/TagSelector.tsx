'use client';

import { useState } from 'react';
import { STANDARD_TAGS, TAG_CATEGORIES, TechnicalTag } from '@/data/tags';
import { FiCheck, FiChevronDown, FiX } from 'react-icons/fi';

interface TagSelectorProps {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
  maxTags?: number;
}

export default function TagSelector({ selectedTags, onChange, maxTags = 10 }: TagSelectorProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['frontend']);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleTag = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      onChange(selectedTags.filter(id => id !== tagId));
    } else {
      if (selectedTags.length < maxTags) {
        onChange([...selectedTags, tagId]);
      }
    }
  };

  const getTagsByCategory = (category: string): TechnicalTag[] => {
    return STANDARD_TAGS.filter(tag => tag.category === category);
  };

  return (
    <div className="space-y-3">
      {/* Label */}
      <div className="flex items-center justify-between text-sm">
        <label className="font-medium text-foreground-600">
          Tags ของค่าย
        </label>
        <span className="text-xs text-foreground-400">
          {selectedTags.length}/{maxTags} selected
        </span>
      </div>

      {/* Selected Tags Preview */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-default-100 rounded-medium">
          {selectedTags.map(tagId => {
            const tag = STANDARD_TAGS.find(t => t.id === tagId);
            if (!tag) return null;
            return (
              <button
                key={tagId}
                onClick={() => toggleTag(tagId)}
                className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium bg-primary text-primary-foreground rounded-full hover:opacity-80 transition-opacity"
              >
                {tag.nameTh}
                <FiX className="text-xs" />
              </button>
            );
          })}
        </div>
      )}

      {/* Categories */}
      <div className="space-y-2">
        {Object.entries(TAG_CATEGORIES).map(([categoryKey, categoryName]) => {
          const tags = getTagsByCategory(categoryKey);
          const isExpanded = expandedCategories.includes(categoryKey);
          const selectedInCategory = tags.filter(t => selectedTags.includes(t.id)).length;

          return (
            <div key={categoryKey} className="border border-divider rounded-medium overflow-hidden">
              {/* Category Header */}
              <button
                type="button"
                onClick={() => toggleCategory(categoryKey)}
                className="w-full px-4 py-3 bg-default-50 hover:bg-default-100 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{categoryName}</span>
                  {selectedInCategory > 0 && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-primary text-primary-foreground rounded-full">
                      {selectedInCategory}
                    </span>
                  )}
                </div>
                <FiChevronDown 
                  className={`text-lg transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Tags List */}
              {isExpanded && (
                <div className="p-3 bg-content1">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {tags.map(tag => {
                      const isSelected = selectedTags.includes(tag.id);
                      const isDisabled = !isSelected && selectedTags.length >= maxTags;

                      return (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => !isDisabled && toggleTag(tag.id)}
                          disabled={isDisabled}
                          className={`
                            px-3 py-2 text-sm font-medium rounded-medium text-left transition-all
                            ${isSelected
                              ? 'bg-primary text-primary-foreground'
                              : isDisabled
                              ? 'bg-default-100 text-default-300 cursor-not-allowed'
                              : 'bg-default-100 hover:bg-default-200 text-foreground'
                            }
                          `}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs">{tag.nameTh}</span>
                            {isSelected && (
                              <FiCheck className="text-sm flex-shrink-0" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Warning */}
      {selectedTags.length >= maxTags && (
        <div className="px-4 py-3 bg-danger-50 border border-danger rounded-medium">
          <p className="text-sm text-danger">
            คุณเลือก tags ครบ {maxTags} รายการแล้ว ลบบางรายการก่อนเพื่อเลือกใหม่
          </p>
        </div>
      )}
    </div>
  );
}
