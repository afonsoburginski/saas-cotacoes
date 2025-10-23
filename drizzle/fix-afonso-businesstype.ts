import { db } from '../drizzle'
import { user } from './schema'
import { eq } from 'drizzle-orm'

async function fixAfonsoBusinnessType() {
  try {
    console.log('🔍 Verificando businessType do usuário Afonso...')
    
    // Buscar o usuário Afonso
    const afonsoUser = await db
      .select()
      .from(user)
      .where(eq(user.email, 'afonsoburginski@gmail.com'))
      .limit(1)
    
    if (afonsoUser.length === 0) {
      console.log('❌ Usuário Afonso não encontrado!')
      return
    }
    
    console.log('📊 Dados atuais do Afonso:')
    console.log('- ID:', afonsoUser[0].id)
    console.log('- Nome:', afonsoUser[0].name)
    console.log('- Email:', afonsoUser[0].email)
    console.log('- businessType:', afonsoUser[0].businessType)
    console.log('- role:', afonsoUser[0].role)
    
    // Atualizar para 'servico'
    if (afonsoUser[0].businessType !== 'servico') {
      console.log('\n🔄 Atualizando businessType para "servico"...')
      
      await db
        .update(user)
        .set({ 
          businessType: 'servico',
          updatedAt: new Date()
        })
        .where(eq(user.email, 'afonsoburginski@gmail.com'))
      
      console.log('✅ BusinessType atualizado com sucesso!')
      
      // Verificar novamente
      const updatedUser = await db
        .select()
        .from(user)
        .where(eq(user.email, 'afonsoburginski@gmail.com'))
        .limit(1)
      
      console.log('\n📊 Dados atualizados do Afonso:')
      console.log('- businessType:', updatedUser[0].businessType)
      console.log('- updatedAt:', updatedUser[0].updatedAt)
    } else {
      console.log('\n✅ O businessType já está correto como "servico"!')
    }
    
  } catch (error) {
    console.error('❌ Erro ao atualizar businessType:', error)
  }
  
  process.exit(0)
}

fixAfonsoBusinnessType()

