export interface CepData {
  cep: string
  logradouro: string
  complemento: string
  bairro: string
  localidade: string
  uf: string
  erro?: boolean
}

export async function buscarCep(cep: string): Promise<CepData | null> {
  try {
    const cepLimpo = cep.replace(/\D/g, '')
    if (cepLimpo.length !== 8) return null
    
    const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`)
    if (!response.ok) return null
    
    const data: CepData = await response.json()
    if (data.erro) return null
    
    return data
  } catch (error) {
    console.error('Erro ao buscar CEP:', error)
    return null
  }
}

export function formatarCep(cep: string): string {
  const numeros = cep.replace(/\D/g, '')
  if (numeros.length <= 5) return numeros
  return `${numeros.slice(0, 5)}-${numeros.slice(5, 8)}`
}

