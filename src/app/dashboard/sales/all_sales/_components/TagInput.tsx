import { useState } from 'react';
import styles from './TagInput.module.css';
import './TagInput.module.css';

interface TagInputProps {
  view?: boolean;
  tags: string[];
  onChange: (tags: string[]) => void;
  preview?: any;
}

const TagInput: React.FC<TagInputProps> = ({ view = false, tags, onChange, preview = false }) => {
  const [inputValue, setInputValue] = useState<string>('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const trimmedValue = inputValue.trim().replace(/,$/, '');
      if (trimmedValue && !tags.includes(trimmedValue)) {
        onChange([...tags, trimmedValue]);
        setInputValue('');
      }
    }
  };

  const handleRemoveTag = (tag: string) => {
    onChange(tags.filter((t) => t !== tag));
  };

  return (
    <div className={`flex h-12 items-center gap-3 rounded-md bg-white/60 px-6`}>
      {tags?.map((tag, index) => (
        <div className={styles.tag} key={index}>
          {tag}
          {(!preview || !view) && (
            <span className={styles.removeTag} onClick={() => !view && handleRemoveTag(tag)}>
              &times;
            </span>
          )}
        </div>
      ))}
      <input
        className={`${styles.input} rounded-xl bg-transparent`}
        type="text"
        value={inputValue}
        onChange={(e) => {
          (!preview || !view) && setInputValue(e.target.value);
        }}
        onKeyDown={handleKeyDown}
        placeholder="Separate By Comma or Hit Enter"
        readOnly={preview}
        disabled={view}
      />
    </div>
  );
};

export default TagInput;
