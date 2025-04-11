/**
 * Verifica se um valor é nulo ou indefinido
 */
export const isNullOrUndefined = (value: any): boolean => {
  return value === null || value === undefined;
};

/**
 * Formata uma data para o formato DD/MM/YYYY
 */
export const formatDate = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}/${month}/${year}`;
};

/**
 * Converte um objeto para string URL params
 */
export const objectToUrlParams = (obj: Record<string, any>): string => {
  return Object.entries(obj)
    .filter(([_, value]) => !isNullOrUndefined(value))
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');
}; 