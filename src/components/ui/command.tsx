import { cn } from '@/lib/utils';
import { Command as CommandPrimitive } from 'cmdk';
import { Search } from 'lucide-react';
import { type ComponentPropsWithoutRef, forwardRef } from 'react';

const Command = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<typeof CommandPrimitive>>(
  ({ className, ...props }, ref) => (
    <CommandPrimitive
      ref={ref}
      className={cn('flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground', className)}
      {...props}
    />
  )
);
Command.displayName = CommandPrimitive.displayName ?? 'Command';

const CommandInput = forwardRef<HTMLInputElement, ComponentPropsWithoutRef<typeof CommandPrimitive.Input>>(
  ({ className, ...props }, ref) => (
    <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
      <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
      <CommandPrimitive.Input
        ref={ref}
        className={cn(
          'flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        {...props}
      />
    </div>
  )
);
CommandInput.displayName = CommandPrimitive.Input.displayName ?? 'CommandInput';

const CommandList = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<typeof CommandPrimitive.List>>(
  ({ className, ...props }, ref) => (
    <CommandPrimitive.List
      ref={ref}
      className={cn('max-h-[300px] overflow-y-auto overflow-x-hidden', className)}
      {...props}
    />
  )
);
CommandList.displayName = CommandPrimitive.List.displayName ?? 'CommandList';

const CommandEmpty = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>>(
  (props, ref) => <CommandPrimitive.Empty ref={ref} className="py-6 text-center text-sm" {...props} />
);
CommandEmpty.displayName = CommandPrimitive.Empty.displayName ?? 'CommandEmpty';

const CommandGroup = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<typeof CommandPrimitive.Group>>(
  ({ className, ...props }, ref) => (
    <CommandPrimitive.Group
      ref={ref}
      className={cn(
        'overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground',
        className
      )}
      {...props}
    />
  )
);
CommandGroup.displayName = CommandPrimitive.Group.displayName ?? 'CommandGroup';

const CommandItem = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<typeof CommandPrimitive.Item>>(
  ({ className, ...props }, ref) => (
    <CommandPrimitive.Item
      ref={ref}
      className={cn(
        'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50',
        className
      )}
      {...props}
    />
  )
);
CommandItem.displayName = CommandPrimitive.Item.displayName ?? 'CommandItem';

export { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem };
