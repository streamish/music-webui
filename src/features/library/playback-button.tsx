import { Button } from '../../components/ui/button';

export function PlaybackButton({
  className,
  icon: Icon,
  isActive = false,
  label,
  onChange,
  onHover,
}: {
  className?: string;
  icon: React.ElementType;
  isActive?: boolean;
  label: string;
  onChange: () => void;
  onHover?: () => void;
}) {
  return (
    <Button
      aria-label={label}
      variant="ghost"
      size="icon-lg"
      className={[
        `m-2 p-2 flex-none text-center hover:bg-foreground/20!`,
        `h-10 md:h-12 lg:h-16`,
        `w-10 md:w-12 lg:w-16 `,
        isActive ? 'bg-foreground/10!' : '',
        `hover:bg-foreground/20!`,
        className ?? '',
      ].join(' ')}
      onClick={onChange}
      onMouseOver={onHover}
      onMouseEnter={onHover}
      onMouseLeave={onHover}
    >
      <Icon className="h-8! w-8! md:h-10! md:w-10! lg:h-12! lg:w-12!" strokeWidth={1} />
    </Button>
  );
}
