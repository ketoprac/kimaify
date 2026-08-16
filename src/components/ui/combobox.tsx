import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from './command';
import { Check, ChevronsUpDown } from 'lucide-react';

interface Option {
  id: number;
  label: string;
}

interface Props {
  value: number | null;
  options: Option[];
  onChange: (id: number | null) => void;
  placeholder: string;
  loading?: boolean;
  disabled?: boolean;
  error?: string;
}

export function Combobox({ value, options, onChange, placeholder, loading, disabled }: Props) {
  const [open, setOpen] = useState(false);

  const selectedLabel = value !== null ? options.find((o) => o.id === value)?.label : null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between font-normal h-11 px-3 truncate"
        >
          <span className={selectedLabel ? '' : 'text-muted-foreground truncate'}>
            {loading ? 'Loading...' : selectedLabel ?? placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandList>
            <CommandEmpty>No results</CommandEmpty>
            <CommandGroup>
              {options.map((o) => (
                <CommandItem
                  key={o.id}
                  value={o.label}
                  onSelect={() => {
                    onChange(o.id === value ? null : o.id);
                    setOpen(false);
                  }}
                >
                  <Check className={cn('mr-2 h-4 w-4', o.id === value ? 'opacity-100' : 'opacity-0')} />
                  {o.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
