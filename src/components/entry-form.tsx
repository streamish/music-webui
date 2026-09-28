import { FormValidationError } from './form-validation-error';
import { Input } from './ui/input';

export function EntryForm({ ...rest }) {
  return (
    <form
      className="
      p-10 
      bg-card/50
      rounded-2xl 
      drop-shadow-lg 
      space-y-5 
      shadow max-w-96 
      text-card-foreground
      border-solid 
      border 
      border-border"
      {...rest}
    />
  );
}

export function EntryFormButton({ text, type }: { text: string; type: 'submit' | 'button' | 'reset' }) {
  return (
    <button
      className="
        w-full 
        px-10 py-2 
        bg-primary
        text-primary-foreground
        rounded-xl
        hover:bg-primary/80
        hover:drop-shadow-md 
        duration-300 
        ease-in 
        cursor-pointer"
      type={type}
    >
      {text}
    </button>
  );
}

export function EntryFormDescription({ children }: { children?: React.ReactNode }) {
  return <p className="m-0 p-0 mb-4 text-sm text-foreground/80">{children}</p>;
}

export function EntryFormError({ text }: { text?: string }) {
  return <FormValidationError text={text || ''} />;
}

export function EntryFormHeading({ text }: { text: string }) {
  return <h1 className="text-xl m-0 p-0 mb-2 text-foreground">{text}</h1>;
}

export function EntryFormHorizontalGroup({ children }: { children?: React.ReactNode }) {
  return <div className="flex flex-row space-x-2">{children}</div>;
}

export function EntryFormInput({
  id,
  type = 'text',
  placeholder,
  ...rest
}: {
  id: string;
  type?: string;
  placeholder?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <Input
      id={id}
      type={type}
      placeholder={placeholder}
      className="px-3 py-2 rounded-md border border-border/50"
      {...rest}
    />
  );
}

export function EntryFormLabel({ text, htmlFor }: { text: string; htmlFor: string }) {
  return (
    <label className="text-xs font-semibold cursor-pointer" htmlFor={htmlFor}>
      {text}
    </label>
  );
}

export function EntryFormVerticalGroup({ children }: { children?: React.ReactNode }) {
  return <div className="flex flex-col space-y-1">{children}</div>;
}
