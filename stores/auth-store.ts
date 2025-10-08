import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type UserRole = 'consumidor' | 'fornecedor' | 'admin'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
  // Campos específicos para fornecedores
  businessName?: string
  businessType?: 'comercio' | 'servico'
  plan?: 'basico' | 'premium'
  // Campos específicos para consumidores
  phone?: string
  address?: string
}

interface AuthState {
  // Estado
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  
  // Ações de autenticação
  login: (email: string, password: string, role?: UserRole) => Promise<void>
  loginWithGoogle: (googleUser: { email: string; name: string; avatar?: string }) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  
  // Ações de usuário
  updateUser: (data: Partial<User>) => void
  
  // Helpers
  isFornecedor: () => boolean
  isConsumidor: () => boolean
  isAdmin: () => boolean
}

interface RegisterData {
  name: string
  email: string
  password: string
  role: UserRole
  // Campos opcionais baseados no role
  businessName?: string
  businessType?: 'comercio' | 'servico'
  plan?: 'basico' | 'premium'
  phone?: string
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      user: null,
      isAuthenticated: false,
      isLoading: false,

      // Login (fake por enquanto)
      login: async (email: string, password: string, role?: UserRole) => {
        set({ isLoading: true })
        
        // Simular API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Mock user baseado no email e role
        const mockUser: User = {
          id: Math.random().toString(36).substr(2, 9),
          name: email.split('@')[0],
          email,
          role: role || 'consumidor',
          avatar: '/placeholder-user.jpg'
        }

        // Adicionar campos específicos baseados no role
        if (mockUser.role === 'fornecedor') {
          mockUser.businessName = `${mockUser.name} Materiais`
          mockUser.businessType = 'comercio'
          mockUser.plan = 'basico'
        }

        set({ 
          user: mockUser, 
          isAuthenticated: true, 
          isLoading: false 
        })
      },

      // Login com Google (fake por enquanto)
      loginWithGoogle: async (googleUser: { email: string; name: string; avatar?: string }) => {
        set({ isLoading: true })
        
        // Simular API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Criar usuário sem role definida (será definida no onboarding)
        const mockUser: User = {
          id: Math.random().toString(36).substr(2, 9),
          name: googleUser.name,
          email: googleUser.email,
          role: 'consumidor', // Temporário, será atualizado no onboarding
          avatar: googleUser.avatar || '/placeholder-user.jpg'
        }
        
        set({ 
          user: mockUser, 
          isAuthenticated: true, 
          isLoading: false 
        })
      },

      // Registro (fake por enquanto)
      register: async (data: RegisterData) => {
        set({ isLoading: true })
        
        // Simular API call
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        const newUser: User = {
          id: Math.random().toString(36).substr(2, 9),
          name: data.name,
          email: data.email,
          role: data.role,
          avatar: '/placeholder-user.jpg'
        }

        // Adicionar campos específicos
        if (data.role === 'fornecedor') {
          newUser.businessName = data.businessName || `${data.name} Materiais`
          newUser.businessType = data.businessType || 'comercio'
          newUser.plan = data.plan || 'basico'
        } else if (data.role === 'consumidor') {
          newUser.phone = data.phone
        }

        set({ 
          user: newUser, 
          isAuthenticated: true, 
          isLoading: false 
        })
      },

      // Logout
      logout: () => {
        set({ 
          user: null, 
          isAuthenticated: false, 
          isLoading: false 
        })
      },

      // Atualizar usuário
      updateUser: (data: Partial<User>) => {
        const currentUser = get().user
        if (currentUser) {
          set({ 
            user: { ...currentUser, ...data } 
          })
        }
      },

      // Helpers
      isFornecedor: () => get().user?.role === 'fornecedor',
      isConsumidor: () => get().user?.role === 'consumidor',
      isAdmin: () => get().user?.role === 'admin',
    }),
    {
      name: 'auth-storage', // Nome da chave no localStorage
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }), // Só persiste user e isAuthenticated
    }
  )
)
