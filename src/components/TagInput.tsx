import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../auth/useAuth';
import { getTags } from '../api/tags';
import { X, ChevronDown } from 'lucide-react';

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export function TagInput({ value, onChange }: Props) {
  const { token } = useAuth();
  const [allTags, setAllTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch tags from backend on mount
  useEffect(() => {
    let cancelled = false;
    setFetchError(null);
    getTags()
      .then((data) => {
        if (!cancelled) setAllTags(data);
      })
      .catch((err) => {
        if (!cancelled) setFetchError(err.message || 'Failed to load tags');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [token]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Parse current value into selected tags
  const selected = value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  // Available tags = allTags minus already selected, filtered by search
  const filtered = allTags
    .filter((t) => !selected.includes(t))
    .filter((t) => t.toLowerCase().includes(search.toLowerCase()));

  const addTag = (tag: string) => {
    const next = [...selected, tag];
    onChange(next.join(', '));
    setSearch('');
    setOpen(false);
  };

  const removeTag = (tag: string) => {
    const next = selected.filter((t) => t !== tag);
    onChange(next.join(', '));
  };

  const toggleDropdown = () => {
    if (!open) {
      // Reset scroll to top when opening
      setSearch('');
    }
    setOpen((prev) => !prev);
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Input area with chips */}
      <div
        onClick={toggleDropdown}
        className="flex items-center gap-1 flex-wrap min-h-[44px] w-full border border-input rounded-md px-3 py-1.5 text-sm cursor-pointer bg-background"
      >
        {selected.length === 0 && (
          <span className="text-muted-foreground px-1">
            {loading ? 'Loading tags...' : fetchError ? 'Failed to load tags' : 'Select tags...'}
          </span>
        )}

        {selected.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-0.5 bg-brand-green-soft text-brand-green-dark rounded-full px-2 py-0.5 text-xs"
          >
            {tag}
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeTag(tag);
              }}
              className="hover:text-brand-green-dark cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}

        <ChevronDown
          className={`w-3.5 h-3.5 text-muted-foreground ml-auto flex-shrink-0 transition-transform ${
            open ? 'rotate-180' : ''
          }`}
        />
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-10 left-0 right-0 top-full mt-1 bg-background border border-hairline rounded-md shadow-lg">
          {/* Search within dropdown */}
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tags..."
            className="w-full border-b border-hairline-soft px-3 py-2 text-sm outline-none rounded-t bg-background"
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />

          <ul className="max-h-44 overflow-auto">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-muted-foreground">
                {allTags.length === 0 ? 'No tags available' : 'No matching tags'}
              </li>
            ) : (
              filtered.map((tag) => (
                <li
                  key={tag}
                  onClick={() => addTag(tag)}
                  className="px-3 py-2 text-sm cursor-pointer hover:bg-surface"
                >
                  {tag}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
