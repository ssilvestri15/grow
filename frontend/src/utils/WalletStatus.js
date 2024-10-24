// Definizione degli stati
const EmptyState = { kind: "empty" };
const LoadingState = { kind: "loading" };
const FailedState = (msg) => ({ kind: "failed", msg });
const SuccessState = (data) => ({ kind: "success", data });

// Funzione per restituire un nuovo stato del wallet
export const WalletState = {
  empty: () => EmptyState,
  loading: () => LoadingState,
  failed: (msg) => FailedState(msg),
  success: (data) => SuccessState(data),
};