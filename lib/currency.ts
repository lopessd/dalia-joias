/**
 * Utilitário para formatação de moeda guarani paraguaio
 */
export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '₲0'
  }

  // Formatação com separadores de milhares usando ponto
  return `₲${value.toLocaleString('es-PY')}`
}

/**
 * Converte valor de real brasileiro para guarani paraguaio
 * Taxa aproximada: 1 BRL = 1200 PYG
 */
export function convertBRLToPYG(brlValue: number): number {
  return Math.round(brlValue * 1200)
}