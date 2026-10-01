import {
  EntryForm,
  EntryFormButton,
  EntryFormDescription,
  EntryFormError,
  EntryFormHeading,
  EntryFormHorizontalGroup,
  EntryFormInput,
  EntryFormLabel,
  EntryFormVerticalGroup,
} from '@/components';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '@/lib/api';
import z from 'zod/v3';
import type { components } from '@/types/api-schema';

type GuestCreateSessionBadRequestResponseDto = components['schemas']['GuestCreateSessionBadRequestResponseDto'];

type FormData = {
  username: string;
  password: string;
  remember?: boolean;
};

const schema = z.object({
  username: z.string().min(1, { message: 'Username is too short' }).max(255, { message: 'Username is too long' }),
  password: z.string().min(1, { message: 'Password is too short' }).max(255, { message: 'Password is too long' }),
  remember: z.boolean().optional(),
});

export default function SignInPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = handleSubmit(async (formData: FormData) => {
    try {
      const { error, data } = await api.post('/api/guest/create-session', {
        body: {
          username: formData.username,
          password: formData.password,
          expiresDays: formData.remember ? 3650 : 1,
        },
      });
      if (error) {
        let message: string;
        if (error instanceof Error) {
          message = error.message;
        } else {
          const errorResponse = error as GuestCreateSessionBadRequestResponseDto;
          message = errorResponse.message[0] || 'An unknown error occurred';
        }
        throw new Error(message);
      }
      if (!data.success || !data.jwtToken) {
        throw new Error('An unknown error occurred');
      }
      login(data.jwtToken, formData.remember);
      const params = new URLSearchParams(window.location.search);
      const returnUrl = params.get('returnUrl') || '/';
      if (!returnUrl.startsWith('/')) {
        await navigate('/');
      }
      await navigate(returnUrl);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error signing in:', error instanceof Error ? error.message : error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      switch (errorMessage) {
        case 'invalid-username-error':
          setError('username', {
            type: 'manual',
            message: 'Your username is not valid',
          });
          return;
        case 'invalid-password-error':
          setError('password', {
            type: 'manual',
            message: 'Your password is not valid',
          });
          return;
        default:
          toast.error('An unknown error occurred');
      }
    }
  });

  return (
    <EntryForm onSubmit={onSubmit}>
      <title>Sign in</title>
      <EntryFormHeading text="Sign in" />
      <EntryFormDescription>
        Administrators can reset passwords through the web interface or via command line.
      </EntryFormDescription>
      <EntryFormVerticalGroup>
        <EntryFormLabel text="Username" htmlFor="username" />
        <EntryFormInput
          type="text"
          id="username"
          placeholder="Enter your username"
          {...register('username', { required: true })}
        />
        <EntryFormError text={errors.username?.message} />
      </EntryFormVerticalGroup>
      <EntryFormVerticalGroup>
        <EntryFormLabel text="Password" htmlFor="password" />
        <EntryFormInput
          id="password"
          type="password"
          placeholder="Enter your password"
          {...register('password', { required: true })}
        />
        <EntryFormError text={errors.password?.message} />
      </EntryFormVerticalGroup>
      <EntryFormHorizontalGroup>
        <input type="checkbox" id="remember" {...register('remember')} />
        <EntryFormLabel text="Remember me indefinitely" htmlFor="remember" />
      </EntryFormHorizontalGroup>
      <EntryFormButton text="Sign In" type="submit" />
    </EntryForm>
  );
}
