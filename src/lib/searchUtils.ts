/**
 * Normaliza texto para búsqueda flexible
 * Remueve tildes, convierte a minúsculas y normaliza caracteres especiales
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD') // Descompone caracteres acentuados
    .replace(/[\u0300-\u036f]/g, '') // Remueve marcas diacríticas (tildes)
    .replace(/[._-]/g, ' ') // Convierte puntos, guiones bajos y guiones a espacios
    .replace(/[^\w\s]/g, '') // Remueve otros caracteres especiales excepto letras, números y espacios
    .replace(/\s+/g, ' ') // Normaliza espacios múltiples a uno solo
    .trim();
}

/**
 * Crea un patrón de búsqueda flexible para SQL LIKE
 * Normaliza el término de búsqueda y crea un patrón que ignore tildes y mayúsculas
 */
export function createFlexibleSearchPattern(searchTerm: string): string {
  const normalized = normalizeText(searchTerm);
  
  // Si el término está vacío, devolver patrón que no coincida
  if (!normalized) return '';
  
  // Crear patrón que busque variaciones del término
  const words = normalized.split(' ').filter(word => word.length > 0);
  
  if (words.length === 0) return '';
  
  // Para cada palabra, crear variaciones con y sin tildes
  const patterns = words.map(word => {
    const variations = [
      word, // palabra original normalizada
      word.replace(/a/g, '[aá]'), // a o á
      word.replace(/e/g, '[eé]'), // e o é
      word.replace(/i/g, '[ií]'), // i o í
      word.replace(/o/g, '[oó]'), // o o ó
      word.replace(/u/g, '[uú]'), // u o ú
      word.replace(/n/g, '[nñ]'), // n o ñ
      word.replace(/c/g, '[cç]'), // c o ç
    ];
    
    // Combinar todas las variaciones en un patrón
    return `(${variations.join('|')})`;
  });
  
  // Unir todas las palabras con .* para permitir texto entre ellas
  return patterns.join('.*');
}

/**
 * Función auxiliar para crear condiciones de búsqueda flexible
 */
export function createFlexibleSearchConditions(searchTerm: string, fields: string[]): string {
  const pattern = createFlexibleSearchPattern(searchTerm);
  
  if (!pattern) return '';
  
  // Crear condiciones para cada campo
  const conditions = fields.map(field => 
    `LOWER(REGEXP_REPLACE(REGEXP_REPLACE(${field}, '[áàäâ]', 'a', 'g'), '[éèëê]', 'e', 'g')) LIKE '%${normalizeText(searchTerm)}%'`
  );
  
  return conditions.join(' OR ');
}
