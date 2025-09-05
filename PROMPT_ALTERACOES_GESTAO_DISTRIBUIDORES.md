# PROMPT DE ALTERAÇÃO PARA GESTÃO DE DISTRIBUIDORES

## CONTEXTO DO BANCO DE DADOS

**IMPORTANTE: NÃO ALTERAR A ESTRUTURA DO BANCO DE DADOS**

**Estrutura Atual:**
- `auth.users`: Tabela de autenticação do Supabase (gerenciada automaticamente)
- `profiles`: Tabela com informações dos usuários
  - `id` (UUID): FK para `auth.users.id`
  - `role` (enum): 'admin' ou 'reseller'
  - `active` (boolean): Status do perfil
  - `address`, `description`, `created_at` (campos adicionais)

**Dados Atuais:**
- 9 usuários na tabela `auth.users`
- 9 registros na tabela `profiles` (1 admin, 8 revendedores)
- Alguns perfis já estão com `active: false`

## ALTERAÇÕES NECESSÁRIAS

### 1. EXCLUSÃO PERMANENTE DE DISTRIBUIDOR

**Objetivo:** Criar botão de exclusão no dropdown menu que DELETE PERMANENTEMENTE o distribuidor do banco de dados (tanto `auth.users` quanto `profiles`).

**Implementação:**

**1.1. Alterar RevendedorCard (`components/revendedores/revendedor-card.tsx`)**
- Adicionar nova opção no DropdownMenu: "Excluir Distribuidor"
- Criar novo estado para modal de exclusão permanente
- Criar novo dialog `PermanentDeleteDistributorDialog`

**1.2. Criar novo componente `PermanentDeleteDistributorDialog`**
```tsx
// components/revendedores/permanent-delete-distributor-dialog.tsx
- Modal com título "Excluir Distribuidor Permanentemente"
- Mostrar warning vermelho explicando que é IRREVERSÍVEL
- Input de confirmação: usuário deve digitar "EXCLUIR" para confirmar
- Dois botões de confirmação em sequência:
  1. "Confirmar Exclusão" (aparece apenas após digitar "EXCLUIR")
  2. "Sim, excluir permanentemente" (aparece após clicar no primeiro)
```

**1.3. Criar API Route para exclusão permanente**
```typescript
// app/api/distributors/[id]/permanent-delete/route.ts
- DELETE permanente usando Supabase Admin API
- 1º: Deletar registro de `profiles` WHERE id = distributor_id
- 2º: Deletar usuário de `auth.users` via Admin API
- Retornar sucesso apenas se ambos foram deletados
```

### 2. ALTERAR MODAL "GERENCIAR PERFIL"

**Objetivo:** Renomear para "Gerenciar Acesso" e alterar comportamento de ativação/desativação.

**Implementação:**

**2.1. Alterar `ManageDistributorDialog` (`components/revendedores/manage-distributor-dialog.tsx`)**
- Alterar título de "Gerenciar Perfil" para "Gerenciar Acesso"
- **Lógica para ATIVAÇÃO:**
  - Se `active: false`: Mostrar opção "Ativar Acesso"
  - Obrigar troca de senha para ativar
  - Só ativar (`active: true`) APÓS senha ser alterada com sucesso
- **Lógica para DESATIVAÇÃO:**
  - Se `active: true`: Mostrar opção "Desativar Acesso"
  - NÃO exigir troca de senha para desativar
  - Confirmar desativação com modal de confirmação simples

**2.2. Atualizar textos e validações:**
```tsx
// Se perfil INATIVO:
- Título seção: "Perfil Inativo - Ativar Acesso"
- Descrição: "Para ativar este distribuidor, é necessário definir uma nova senha"
- Botão: "Ativar Acesso" (só habilitado após senha válida)

// Se perfil ATIVO:
- Título seção: "Perfil Ativo - Gerenciar Acesso"
- Descrição: "Distribuidor pode acessar o sistema normalmente"
- Botão: "Desativar Acesso" (confirmação simples)
```

### 3. ALTERAR INTERAÇÃO COM STATUS BADGES

**Objetivo:** Remover botão "Desativar" do dropdown e criar interação direta com badges de status.

**Implementação:**

**3.1. Remover do DropdownMenu (`components/revendedores/revendedor-card.tsx`)**
- Remover completamente o `DropdownMenuItem` de desativação/ativação
- Manter apenas: "Editar Distribuidor", "Gerenciar Acesso", "Excluir Distribuidor"

**3.2. Tornar Badge clicável**
```tsx
// No RevendedorCard:
<Badge 
  className={`cursor-pointer hover:opacity-80 transition-opacity ${getStatusColor(revendedor.active)}`}
  onClick={() => handleStatusClick(revendedor.active)}
>
  {getStatusText(revendedor.active)}
</Badge>

// Função handleStatusClick:
const handleStatusClick = (isActive: boolean) => {
  if (isActive) {
    // Status ATIVO clicado -> Abrir modal de desativação
    setIsDeactivateDialogOpen(true)
  } else {
    // Status INATIVO clicado -> Abrir modal de gerenciar acesso
    setIsManageDialogOpen(true)
  }
}
```

**3.3. Criar novo dialog `DeactivateDistributorDialog`**
```tsx
// components/revendedores/deactivate-distributor-dialog.tsx
- Modal simples para confirmar desativação
- Título: "Desativar Acesso do Distribuidor"
- Descrição: "O distribuidor não poderá mais fazer login no sistema"
- Warning: "Esta ação pode ser revertida através do Gerenciar Acesso"
- Botões: "Cancelar" e "Desativar"
```

## ESTRUTURA DE ARQUIVOS A SEREM ALTERADOS/CRIADOS

### Arquivos para ALTERAR:
1. `components/revendedores/revendedor-card.tsx` - Adicionar exclusão permanente, remover desativar do dropdown, tornar badge clicável
2. `components/revendedores/manage-distributor-dialog.tsx` - Alterar título e lógica de ativação/desativação
3. `lib/distributors-api.ts` - Adicionar função para exclusão permanente

### Arquivos para CRIAR:
1. `components/revendedores/permanent-delete-distributor-dialog.tsx` - Modal de exclusão permanente
2. `components/revendedores/deactivate-distributor-dialog.tsx` - Modal de desativação simples
3. `app/api/distributors/[id]/permanent-delete/route.ts` - API route para exclusão permanente

## VALIDAÇÕES E REGRAS DE NEGÓCIO

1. **Exclusão Permanente:**
   - Usuário deve digitar "EXCLUIR" para habilitar primeiro botão
   - Dois cliques de confirmação obrigatórios
   - Só admin pode excluir distribuidores
   - Toast de sucesso: "Distribuidor excluído permanentemente"

2. **Ativação de Perfil:**
   - Obrigatório definir nova senha (mín. 6 caracteres)
   - Só ativar DEPOIS que senha for alterada com sucesso
   - Toast: "Distribuidor ativado com sucesso. Nova senha definida."

3. **Desativação de Perfil:**
   - Confirmação simples (um clique)
   - NÃO exigir troca de senha
   - Toast: "Distribuidor desativado com sucesso"

4. **Badge Clicável:**
   - Visual hover para indicar que é clicável
   - ATIVO: abre modal de desativação
   - INATIVO: abre modal de gerenciar acesso

## EXEMPLO DE API PARA EXCLUSÃO PERMANENTE

```typescript
// app/api/distributors/[id]/permanent-delete/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    
    // Cliente admin
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
    
    // 1. Deletar profile
    await supabaseAdmin.from('profiles').delete().eq('id', id)
    
    // 2. Deletar usuário da auth
    await supabaseAdmin.auth.admin.deleteUser(id)
    
    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ error: 'Erro ao excluir distribuidor' }, { status: 500 })
  }
}
```

## OBSERVAÇÕES IMPORTANTES

1. **Não alterar estrutura do banco** - Usar apenas as tabelas e campos existentes
2. **Usar Supabase Admin API** - Para operações de exclusão de usuário
3. **Manter padrão visual** - Seguir design system existente
4. **Tratamento de erros** - Sempre mostrar toasts informativos
5. **Logs de debug** - Manter console.log para debugging
6. **Responsividade** - Manter layout responsivo existente

Este prompt fornece todas as informações necessárias para implementar as funcionalidades solicitadas sem alterar a estrutura do banco de dados.
