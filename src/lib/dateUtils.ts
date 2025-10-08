// Utilidades para manejo de fechas con zona horaria de Perú

/**
 * Obtiene la fecha y hora actual en la zona horaria de Perú (America/Lima)
 * @returns Date object con la fecha/hora actual de Perú
 */
export function getPeruDateTime(): Date {
  // Crear una fecha en la zona horaria de Perú
  const now = new Date();
  const peruTime = new Date(now.toLocaleString("en-US", {timeZone: "America/Lima"}));
  return peruTime;
}

/**
 * Convierte una fecha a string en formato ISO para input date (YYYY-MM-DD)
 * @param date - Fecha a convertir
 * @returns String en formato YYYY-MM-DD
 */
export function toDateInputString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Convierte una fecha a string en formato ISO para input datetime-local (YYYY-MM-DDTHH:MM)
 * @param date - Fecha a convertir
 * @returns String en formato YYYY-MM-DDTHH:MM
 */
export function toDateTimeInputString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Crea una fecha a partir de un string de fecha (YYYY-MM-DD) en zona horaria de Perú
 * @param dateString - String en formato YYYY-MM-DD
 * @returns Date object
 */
export function fromDateString(dateString: string): Date {
  // Crear la fecha directamente en la zona horaria de Perú
  // Usamos el constructor de Date con componentes individuales para evitar problemas de zona horaria
  const [year, month, day] = dateString.split('-').map(Number);
  
  // Crear la fecha en la zona horaria local (que debe ser Perú)
  const date = new Date(year, month - 1, day, 0, 0, 0, 0);
  
  return date;
}

/**
 * Crea una fecha a partir de un string de fecha y hora (YYYY-MM-DDTHH:MM) en zona horaria de Perú
 * @param dateTimeString - String en formato YYYY-MM-DDTHH:MM
 * @returns Date object
 */
export function fromDateTimeString(dateTimeString: string): Date {
  // Crear la fecha en la zona horaria local
  const date = new Date(dateTimeString);
  return date;
}

/**
 * Obtiene la fecha y hora actual de Perú en formato para input datetime-local
 * @returns String en formato YYYY-MM-DDTHH:MM
 */
export function getCurrentPeruDateTimeInput(): string {
  return toDateTimeInputString(getPeruDateTime());
}

/**
 * Obtiene la fecha actual de Perú en formato para input date
 * @returns String en formato YYYY-MM-DD
 */
export function getCurrentPeruDateInput(): string {
  return toDateInputString(getPeruDateTime());
}
