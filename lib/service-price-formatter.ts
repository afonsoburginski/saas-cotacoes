/**
 * Formata o preço de um serviço baseado nos campos disponíveis
 * @param service - Objeto do serviço com campos de preço
 * @returns String formatada do preço
 */
export function formatServicePrice(service: any): string {
  // Se tem preço mínimo e máximo diferentes, mostrar faixa
  if (service.precoMinimo && service.precoMaximo && service.precoMinimo !== service.precoMaximo) {
    return `R$ ${service.precoMinimo} - R$ ${service.precoMaximo}/${service.tipoPrecificacao || 'unidade'}`
  }
  
  // Se tem preço fixo
  if (service.preco && service.preco > 0) {
    return `R$ ${service.preco}/${service.tipoPrecificacao || 'unidade'}`
  }
  
  // Se tem apenas preço mínimo
  if (service.precoMinimo && service.precoMinimo > 0) {
    return `A partir de R$ ${service.precoMinimo}/${service.tipoPrecificacao || 'unidade'}`
  }
  
  // Caso contrário, sob consulta
  return "Sob consulta"
}
