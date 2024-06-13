export default function timeoutPromise<T>(
  promise: Promise<T>,
  ms: number
): Promise<T | null> {
  // Crea una nueva promesa que se resuelve con null después de un tiempo determinado
  const timeout = new Promise<null>(resolve =>
    setTimeout(() => resolve(null), ms)
  );

  // Utiliza Promise.race para resolver la promesa más rápida (la original o la de tiempo límite)
  return Promise.race([promise, timeout]);
}
