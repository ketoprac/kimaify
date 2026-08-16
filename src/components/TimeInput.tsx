import { Input } from './ui/input';

interface Props {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
}

export function TimeInput({ value, onChange, error }: Props) {
  return (
    <div className="relative">
      <Input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={error ? 'border-destructive' : ''}
      />
      {error && <p className="text-destructive text-xs mt-0.5">{error}</p>}
    </div>
  );
}
