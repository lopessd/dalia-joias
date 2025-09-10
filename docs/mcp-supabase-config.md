# Configuração MCP Supabase - Dalia Joias

## Visão Geral

O MCP (Model Context Protocol) do Supabase foi configurado para permitir que agentes de IA tenham acesso direto ao banco de dados do sistema Dalia Joias. Esta configuração permite operações de leitura e escrita no banco de dados através de comandos naturais.

## Configuração Atual

### Arquivo: `.vscode/mcp.json`

```json
{
  "inputs": [
    {
      "type": "promptString",
      "id": "supabase-access-token",
      "description": "Supabase personal access token",
      "password": true
    }
  ],
  "servers": {
    "supabase": {
      "command": "npx",
      "args": ["-y", "@supabase/mcp-server-supabase@latest"],
      "env": {
        "SUPABASE_URL": "https://eelizogeyrjjrfrximif.supabase.co",
        "SUPABASE_ANON_KEY": "[chave-anonima]",
        "SUPABASE_SERVICE_ROLE_KEY": "[chave-service-role]",
        "SUPABASE_ACCESS_TOKEN": "[token-de-acesso]"
      }
    }
  }
}
```

## Variáveis de Ambiente Configuradas

- **SUPABASE_URL**: URL do projeto Supabase
- **SUPABASE_ANON_KEY**: Chave anônima para operações básicas
- **SUPABASE_SERVICE_ROLE_KEY**: Chave de serviço para operações administrativas
- **SUPABASE_ACCESS_TOKEN**: Token de acesso pessoal do Supabase

## Funcionalidades Disponíveis

Com o MCP do Supabase configurado, os agentes podem:

### 1. Consultas de Dados
- Buscar produtos no catálogo
- Listar revendedores e distribuidores
- Consultar histórico de vendas
- Verificar estoque de produtos
- Acessar dados de perfis de usuários

### 2. Operações de Escrita
- Criar novos produtos
- Atualizar informações de produtos
- Gerenciar usuários e perfis
- Registrar movimentações de estoque
- Criar e atualizar pedidos

### 3. Operações Administrativas
- Gerenciar permissões de usuários
- Criar e desativar contas de revendedores
- Monitorar atividades do sistema
- Gerar relatórios de vendas

## Estrutura do Banco de Dados

### Tabelas Principais

#### `auth.users`
- Gerenciamento de autenticação de usuários
- Integração com Supabase Auth

#### `public.profiles`
- Perfis de usuários (admin, reseller)
- Informações complementares dos usuários

#### `public.products`
- Catálogo de produtos (joias)
- Preços, códigos e categorias

#### `public.categories`
- Categorias de produtos
- Organização do catálogo

#### `public.product_photos`
- Imagens dos produtos
- Galeria de fotos das joias

#### `public.inventory_movements`
- Controle de estoque
- Histórico de movimentações

## Exemplos de Uso

### Consultar Produtos
```
"Liste todos os produtos da categoria 'Anéis' que estão ativos"
```

### Verificar Estoque
```
"Qual o estoque atual do produto com código 'AN001'?"
```

### Gerenciar Usuários
```
"Crie um novo revendedor com email 'novo@revendedor.com'"
```

### Relatórios
```
"Gere um relatório de vendas dos últimos 30 dias"
```

## Segurança

### Níveis de Acesso

1. **Chave Anônima (ANON_KEY)**:
   - Operações básicas de leitura
   - Respeitam políticas RLS (Row Level Security)

2. **Chave de Serviço (SERVICE_ROLE_KEY)**:
   - Acesso administrativo completo
   - Bypass das políticas RLS quando necessário

3. **Token de Acesso Pessoal**:
   - Operações específicas da API do Supabase
   - Gerenciamento de projeto

### Políticas de Segurança (RLS)

- **Produtos**: Leitura pública, escrita apenas para admins
- **Perfis**: Usuários podem ver apenas seus próprios dados
- **Vendas**: Revendedores veem apenas suas próprias vendas
- **Estoque**: Acesso restrito a administradores

## Troubleshooting

### Problemas Comuns

1. **Erro de Conexão**:
   - Verificar se as variáveis de ambiente estão corretas
   - Confirmar se o projeto Supabase está ativo

2. **Permissões Negadas**:
   - Verificar políticas RLS
   - Confirmar se a chave correta está sendo usada

3. **Token Expirado**:
   - Renovar o SUPABASE_ACCESS_TOKEN
   - Verificar validade das chaves JWT

### Logs e Monitoramento

- Logs do Supabase disponíveis no dashboard
- Monitoramento de uso de API
- Alertas de segurança configurados

## Manutenção

### Rotação de Chaves
- Renovar tokens periodicamente
- Atualizar variáveis de ambiente
- Testar conectividade após mudanças

### Backup e Recuperação
- Backups automáticos do Supabase
- Procedimentos de recuperação documentados
- Testes de restore regulares

## Contato e Suporte

Para questões relacionadas à configuração do MCP Supabase:
- Documentação oficial: [Supabase MCP Server](https://github.com/supabase/mcp-server-supabase)
- Suporte técnico: Equipe de desenvolvimento Dalia Joias

---

**Última atualização**: Janeiro 2025  
**Versão**: 1.0  
**Status**: Configurado e Ativo