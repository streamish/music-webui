import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api, { TypedApiError } from '@/lib/api';
import type { paths } from '@/types/api-schema';

type ListEndpoint = paths['/api/admin/list-accounts']['get'];
type CreateEndpoint = paths['/api/admin/create-account']['post'];
type DeleteEndpoint = paths['/api/admin/delete-account']['patch'];
type RegenerateSessionKeyEndpoint = paths['/api/admin/regenerate-user-session-key']['post'];
type ResetPasswordEndpoint = paths['/api/admin/reset-user-password']['post'];
type UpdateRolesEndpoint = paths['/api/admin/update-user-roles']['patch'];

type DeleteEndpointVariables = {
  query: DeleteEndpoint['parameters']['query'];
  body: DeleteEndpoint['requestBody']['content']['application/json'];
};

export type AccountDto = ListEndpoint['responses']['200']['content']['application/json']['accounts'][number];

const ACCOUNTS_QUERY_KEY = ['accounts'] as const;

async function fetchAccounts(): Promise<ListEndpoint['responses']['200']['content']['application/json']> {
  const { data, error } = await api.get('/api/admin/list-accounts');
  if (error) {
    throw new TypedApiError<
      | ListEndpoint['responses']['400']['content']['application/json']['message'][number]
      | ListEndpoint['responses']['403']['content']['application/json']['message'][number]
      | ListEndpoint['responses']['500']['content']['application/json']['message'][number]
    >(error.message, error.error);
  }
  if (!data?.accounts) {
    throw new Error('No accounts data received');
  }
  return data;
}

async function createAccountRequest(body: CreateEndpoint['requestBody']['content']['application/json']) {
  const { data, error } = await api.post('/api/admin/create-account', {
    body,
  });
  if (error) {
    throw new TypedApiError<
      | CreateEndpoint['responses']['400']['content']['application/json']['message'][number]
      | CreateEndpoint['responses']['401']['content']['application/json']['message'][number]
      | CreateEndpoint['responses']['403']['content']['application/json']['message'][number]
      | CreateEndpoint['responses']['500']['content']['application/json']['message'][number]
    >(error.message, error.error);
  }
  if (!data?.success) {
    throw new Error('Failed to create account');
  }
  return data;
}

async function regenerateUserSessionKey(query: RegenerateSessionKeyEndpoint['parameters']['query']) {
  const { data, error } = await api.post('/api/admin/regenerate-user-session-key', {
    params: {
      query,
    },
  });
  if (error) {
    throw new TypedApiError<
      | RegenerateSessionKeyEndpoint['responses']['403']['content']['application/json']['message'][number]
      | RegenerateSessionKeyEndpoint['responses']['404']['content']['application/json']['message'][number]
      | RegenerateSessionKeyEndpoint['responses']['500']['content']['application/json']['message'][number]
    >(error.message, error.error);
  }
  if (!data?.success) {
    throw new Error('Failed to regenerate session key for user');
  }
  return data;
}

async function deleteAccountRequest({ query, body }: DeleteEndpointVariables) {
  const { data, error } = await api.patch('/api/admin/delete-account', {
    params: {
      query,
    },
    body,
  });
  if (error) {
    throw new TypedApiError<
      | DeleteEndpoint['responses']['400']['content']['application/json']['message'][number]
      | DeleteEndpoint['responses']['401']['content']['application/json']['message'][number]
      | DeleteEndpoint['responses']['403']['content']['application/json']['message'][number]
      | DeleteEndpoint['responses']['404']['content']['application/json']['message'][number]
      | DeleteEndpoint['responses']['500']['content']['application/json']['message'][number]
    >(error.message, error.error);
  }
  if (!data?.success) {
    throw new Error('Failed to delete account');
  }
  return data;
}

type UpdateRolesVariables = {
  query: UpdateRolesEndpoint['parameters']['query'];
  body: UpdateRolesEndpoint['requestBody']['content']['application/json'];
};

async function updateRolesRequest({ query, body }: UpdateRolesVariables) {
  const { data, error } = await api.patch('/api/admin/update-user-roles', {
    params: {
      query,
    },
    body,
  });
  if (error) {
    throw new TypedApiError<
      | UpdateRolesEndpoint['responses']['400']['content']['application/json']['message'][number]
      | UpdateRolesEndpoint['responses']['401']['content']['application/json']['message'][number]
      | UpdateRolesEndpoint['responses']['403']['content']['application/json']['message'][number]
      | UpdateRolesEndpoint['responses']['404']['content']['application/json']['message'][number]
      | UpdateRolesEndpoint['responses']['500']['content']['application/json']['message'][number]
    >(error.message, error.error);
  }
  if (!data?.success) {
    throw new Error('Failed to update user roles');
  }
  return data;
}

type ResetPasswordVariables = {
  query: ResetPasswordEndpoint['parameters']['query'];
  body: ResetPasswordEndpoint['requestBody']['content']['application/json'];
};

async function resetPasswordRequest({ query, body }: ResetPasswordVariables) {
  const { data, error } = await api.post('/api/admin/reset-user-password', {
    params: {
      query,
    },
    body,
  });
  if (error) {
    throw new TypedApiError<
      | ResetPasswordEndpoint['responses']['400']['content']['application/json']['message'][number]
      | ResetPasswordEndpoint['responses']['401']['content']['application/json']['message'][number]
      | ResetPasswordEndpoint['responses']['403']['content']['application/json']['message'][number]
      | ResetPasswordEndpoint['responses']['404']['content']['application/json']['message'][number]
      | ResetPasswordEndpoint['responses']['500']['content']['application/json']['message'][number]
    >(error.message, error.error);
  }
  if (!data?.success) {
    throw new Error('Failed to reset user password');
  }
  return data;
}

export function useAccounts() {
  const queryClient = useQueryClient();

  const accountsQuery = useQuery<ListEndpoint['responses']['200']['content']['application/json']>({
    queryKey: ACCOUNTS_QUERY_KEY,
    queryFn: fetchAccounts,
  });

  const invalidateAccounts = () => {
    queryClient.invalidateQueries({ queryKey: ACCOUNTS_QUERY_KEY });
  };

  const createAccount = useMutation<
    CreateEndpoint['responses']['201']['content']['application/json'],
    TypedApiError<CreateEndpoint['responses']['400']['content']['application/json']['message'][number]>,
    CreateEndpoint['requestBody']['content']['application/json']
  >({
    mutationFn: createAccountRequest,
    onSuccess: invalidateAccounts,
  });

  const deleteAccount = useMutation<
    DeleteEndpoint['responses']['200']['content']['application/json'],
    TypedApiError<
      | DeleteEndpoint['responses']['400']['content']['application/json']['message'][number]
      | DeleteEndpoint['responses']['404']['content']['application/json']['message'][number]
    >,
    DeleteEndpointVariables
  >({
    mutationFn: deleteAccountRequest,
    onSuccess: invalidateAccounts,
  });

  const regenerateSessionKey = useMutation<
    RegenerateSessionKeyEndpoint['responses']['200']['content']['application/json'],
    TypedApiError<RegenerateSessionKeyEndpoint['responses']['404']['content']['application/json']['message'][number]>,
    RegenerateSessionKeyEndpoint['parameters']['query']
  >({
    mutationFn: regenerateUserSessionKey,
    onSuccess: invalidateAccounts,
  });

  const updateRoles = useMutation<
    UpdateRolesEndpoint['responses']['200']['content']['application/json'],
    TypedApiError<
      | UpdateRolesEndpoint['responses']['400']['content']['application/json']['message'][number]
      | UpdateRolesEndpoint['responses']['404']['content']['application/json']['message'][number]
    >,
    UpdateRolesVariables
  >({
    mutationFn: updateRolesRequest,
    onSuccess: invalidateAccounts,
  });

  const resetPassword = useMutation<
    ResetPasswordEndpoint['responses']['200']['content']['application/json'],
    TypedApiError<
      | ResetPasswordEndpoint['responses']['400']['content']['application/json']['message'][number]
      | ResetPasswordEndpoint['responses']['404']['content']['application/json']['message'][number]
    >,
    ResetPasswordVariables
  >({
    mutationFn: resetPasswordRequest,
    onSuccess: invalidateAccounts,
  });

  return {
    createAccount: createAccount.mutateAsync,
    deleteAccount: deleteAccount.mutateAsync,
    refetchAccounts: accountsQuery.refetch,
    regenerateSessionKey: regenerateSessionKey.mutateAsync,
    resetPassword: resetPassword.mutateAsync,
    updateRoles: updateRoles.mutateAsync,
    accounts: accountsQuery.data,
    isDeleting: deleteAccount.isPending,
    isLoadingAccounts: accountsQuery.isLoading,
    isRegeneratingSessionKey: regenerateSessionKey.isPending,
    isResettingPassword: resetPassword.isPending,
    isUpdatingRoles: updateRoles.isPending,
  };
}
