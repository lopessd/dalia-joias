# Tarefa: Implementação de Autenticação Funcional com Supabase

## Resumo
Salvar o prompt/tarefa detalhada solicitada como um arquivo de tarefa no projeto. Este arquivo contém o escopo, passos técnicos, comandos e critérios de aceite para que um desenvolvedor implemente a autenticação usando Supabase sem modificar a estrutura do banco de dados.

> Não modificar nenhuma estrutura do banco de dados.

---

## Objetivo
Implementar sistema de autenticação completo usando Supabase Auth, com notificações de erro via toast e redirecionamento baseado em roles, usando a estrutura já existente do projeto.

## Pré-requisitos
- Banco Supabase já configurado com tabela `profiles` e roles (admin/reseller).
- Políticas RLS configuradas (ex.: `is_admin` usada para políticas).
- Sistema de toast já presente no frontend (Radix UI + implementação em `components/ui/toast.tsx`).
- NÃO ALTERAR esquema do banco.

---

## Checklist de Requisitos (visível para o dev)
- [x] Integrar `@supabase/supabase-js` ao projeto
- [x] Criar `lib/supabase.ts` com client configurado
- [x] Substituir `components/auth/auth-context.tsx` para usar Supabase
- [x] Atualizar `app/page.tsx` para usar `useAuth()` e mostrar toasts de erro
- [x] Proteger rotas com `components/auth/route-guard.tsx`
- [x] Atualizar `app/admin/layout.tsx` e `app/revendedor/layout.tsx` para usar guard
- [x] Não alterar nenhuma tabela, coluna ou RLS no banco
- [ ] Testes manuais básicos executados e registrados

---

## Passos detalhados para implementação

### 1) Instalação de dependências
Executar no terminal (PowerShell):

```powershell
pnpm add @supabase/supabase-js
```

### 2) Criar o cliente Supabase
Criar o arquivo `lib/supabase.ts` com o conteúdo:

```ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

export interface Profile {
  id: string
  role: 'admin' | 'reseller'
  created_at: string
}

export interface UserWithProfile {
  id: string
  email: string
  role: 'admin' | 'reseller'
}
```

> Nota: Não incluir chaves secretas no repositório. Usar variáveis de ambiente definidas em `.env.local` ou no ambiente de deployment.

### 3) Atualizar `components/auth/auth-context.tsx`
Substituir a implementação mock atual por uma implementação que:
- Use `supabase.auth` para login/logout
- Ao obter sessão, busque o `profile` em `public.profiles` para recuperar `role`
- Exponha `user`, `login(email,password)`, `logout()` e `isLoading`
- Use os toasts (hook `useToast`) para apresentar erros em português

Pontos importantes:
- Mapear role `reseller` → `revendedor` na UI quando for necessário
- Persistir sessão com `supabase.auth.onAuthStateChange`
- Remover credenciais hardcoded

Exemplos de mensagens de toast (em pt-BR):
- Credenciais inválidas: "Email ou senha incorretos"
- Email não confirmado: "Email não confirmado. Verifique sua caixa de entrada."
- Erro de rede: "Erro de conexão. Tente novamente."
- Sucesso: "Login realizado com sucesso!"

### 4) Atualizar `app/page.tsx` (login)
- Consumir `useAuth()` e chamar `login(email,password)` no submit
- Apresentar toast de erro quando `login` falhar
- Ao logar com sucesso, redirecionar conforme role:
  - `admin` → `/admin/dashboard`
  - `revendedor` → `/revendedor/dashboard`
- Desabilitar botão durante `isLoading`

### 5) Proteger rotas (Route Guard)
Criar `components/auth/route-guard.tsx` (ou similar) que:
- Verifique `user` do `AuthContext`
- Aceite props para roles permitidos
- Redirecione para `/` (login) se não autenticado
- Redirecione para dashboard adequado se autenticado mas sem permissão

### 6) Atualizar layouts protegidos
Nos layouts `app/admin/layout.tsx` e `app/revendedor/layout.tsx`:
- Envolver children com `RouteGuard` que verifique role
- Exibir botão de logout que chama `logout()` do `AuthContext`
- Exibir nome/email do usuário logado (opcional)

### 7) Tratamento de erros e edge-cases
- Tratar `invalid_login_credentials` / respostas do Supabase e mapear para mensagens claras
- Auto-logout e toast quando a sessão expirar
- Tratar `too_many_requests` e informar o usuário
- Manter o usuário na rota desejada após login (retornar ao destino original)

### 8) Segurança
- Não armazenar senhas no frontend
- Não publicar chaves privadas (usar `NEXT_PUBLIC_` apenas para o anon key)
- Respeitar RLS — operações protegidas devem ocorrer via Supabase Auth e policies

### 9) Testes manuais obrigatórios
1. Login com credenciais válidas (admin)
2. Login com credenciais válidas (revendedor)
3. Login com credenciais inválidas → toast vermelho com "Email ou senha incorretos"
4. Logout e tentativa de acesso a rota protegida
5. Recarregar página com sessão ativa (persistência)
6. Acessar `/admin` como revendedor → acesso negado e redirecionamento
7. Acessar `/revendedor` como admin → acessar normalmente (se desejado) ou redirecionar conforme política
8. Simular sessão expirada → auto-logout + toast

---

## Critérios de Aceitação
- [ ] Login funcional com Supabase Auth
- [ ] Toast de erro aparece quando credenciais inválidas
- [ ] Redirecionamento por role implementado
- [ ] Logout limpa sessão
- [ ] Rotas protegidas corretamente bloqueadas
- [ ] Nenhuma alteração no schema do banco
- [ ] Tipos TypeScript adicionados e sem erros de compilação

---

## Arquivos a criar/alterar (sugestão)
- Criar: `lib/supabase.ts` (cliente)
- Criar: `components/auth/route-guard.tsx`
- Alterar: `components/auth/auth-context.tsx` (substituir mock)
- Alterar: `app/page.tsx` (login)
- Alterar: `app/admin/layout.tsx`
- Alterar: `app/revendedor/layout.tsx`
- Atualizar `package.json` (dependência `@supabase/supabase-js`)

---

## Notas finais
- Evitar qualquer alteração no banco de dados; apenas ler e usar `public.profiles` para mapear roles.
- Se houver necessidade de criar funções auxiliares no banco (por exemplo, views para facilitar leitura), abrir solicitação separada e aprovar com o time de backend/DB.
- Documentar no PR quais arquivos foram alterados e um resumo de testes manuais realizados.

---

Arquivo gerado automaticamente: `.bmad-core/tasks/implement-supabase-auth.md`
