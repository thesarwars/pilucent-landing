import { useEffect, useState } from 'react';
import styles from './tag.module.css';
import './tag.module.css';
import { GetData } from '@/services/FetchMethods';
import GetToken from '@/hooks/getToken';

interface TagInputProps {
  tags: string[];
  preview?: boolean;
  journalUid?: string;
  onChange: (tags: string[]) => void;
  view?: boolean;
}

const TagInput: React.FC<TagInputProps> = ({
  tags,
  onChange,
  preview,
  journalUid,
  view = false,
}) => {
  const [inputValue, setInputValue] = useState<string>('');
  const token = '';

  useEffect(() => {
    const fetchExistingTags = async () => {
      if (journalUid) {
        try {
          const response = await GetData(`we/journals/${journalUid}/tags`, token);

          if (response?.results) {
            const fetchedTags = response.results.map((tag: any) => tag.title);
            // Only update if we have new tags and they're different from current tags
            if (fetchedTags.length > 0 && JSON.stringify(fetchedTags) !== JSON.stringify(tags)) {
              onChange(fetchedTags);
            }
          }
        } catch (error) {
          console.error('Error fetching tags:', error);
        }
      }
    };

    fetchExistingTags();
  }, [journalUid]);

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
    <div className="mt-5">
      <p className={`py-1 text-sm font-medium ${preview && 'border-b-2'}`}>Tag</p>
      <div
        className={`h-[48px] w-full rounded-xl bg-white/60 px-5 ${styles.tagContainer} ${preview ? 'border-0' : 'border-1 border border-white/70'}`}
      >
        {tags.map((tag, index) => (
          <div className={styles.tag} key={index}>
            {tag}
            <span className={styles.removeTag} onClick={() => handleRemoveTag(tag)}>
              &times;
            </span>
          </div>
        ))}
        <input
          className={`${styles.input} rounded-xl bg-transparent`}
          type="text"
          disabled={view}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Comma Separate or Enter"
        />
      </div>
    </div>
  );
};

export default TagInput;
