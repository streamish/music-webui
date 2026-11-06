import { Moon, Sun } from 'lucide-react';
import { Switch } from '../components/ui/switch';
import { useTheme } from '@/hooks/use-theme';

export function DarkModeSwitch({
  className,
  onChange,
  ...rest
}: {
  className?: string;
  onChange?: () => void;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const { isDark, setIsDark } = useTheme();

  const clickHandler = (checked: boolean) => {
    setIsDark(checked);
    onChange?.();
  };

  return (
    <div className={`flex flex-row space-x-2 ${className ?? ''}`} {...rest}>
      <Sun className="mt-0.5 h-4 w-4" />

      <Switch role="button" aria-label="Toggle dark mode" checked={isDark} onCheckedChange={clickHandler} />

      <Moon className="mt-0.5 h-4 w-4" />
    </div>
  );
}
