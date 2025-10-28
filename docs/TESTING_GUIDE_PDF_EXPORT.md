# 🧪 Guia de Teste: Exportação de PDF para Mostruários

## ✅ Pré-requisitos

- ✅ Servidor rodando: `pnpm run dev`
- ✅ Navegador aberto em: `http://localhost:3000`
- ✅ Usuário logado como **admin**
- ✅ Pelo menos 1 mostruário existente no sistema

---

## 🎯 Cenários de Teste

### Teste 1: Mostruário Entregue (Sem Retornos/Vendas)

**Objetivo:** Validar PDF básico com produtos enviados

**Passos:**
1. Acesse `/admin/mostruario`
2. Localize um mostruário com status **"Entregue"** (azul)
3. Clique no menu (⋮) do card
4. Clique em **"Exportar PDF"**

**Resultado Esperado:**
- ✅ Toast: "Gerando PDF..."
- ✅ Download automático: `Anexo-Piezas-MST-XXXXX.pdf`
- ✅ Toast: "PDF do mostruário MST-XXXXX gerado com sucesso!"
- ✅ PDF contém:
  - Logo Dalia Joias (azul)
  - Título: "Anexo de Piezas Consignadas"
  - Código do mostruário
  - Dados do distribuidor
  - Tabela com todos os produtos
  - Totais calculados corretamente
  - Linha de assinatura
- ✅ PDF tem **1 página** apenas

---

### Teste 2: Mostruário Finalizado (Sem Venda)

**Objetivo:** Validar PDF com retornos mas sem venda

**Passos:**
1. Acesse `/admin/mostruario`
2. Localize um mostruário com status **"Finalizado"** (verde)
3. Sem item "Venta Registrada" no menu
4. Clique em **"Exportar PDF"**

**Resultado Esperado:**
- ✅ Download: `Anexo-Piezas-MST-XXXXX.pdf`
- ✅ PDF contém página 1 completa
- ✅ Produtos mostram quantidades enviadas
- ✅ PDF tem **1 página** (sem relatório de venda)

---

### Teste 3: Mostruário Finalizado (Com Venda Registrada) ⭐

**Objetivo:** Validar PDF completo com 2 páginas

**Passos:**
1. Acesse `/admin/mostruario`
2. Localize mostruário **MST-00006** (ou outro com venda)
3. Verifique que tem **"Venta Registrada"** no menu
4. Clique em **"Exportar PDF"**

**Resultado Esperado:**
- ✅ Download: `Anexo-Piezas-MST-00006.pdf`
- ✅ **Página 1:**
  - Código: MST-00006
  - Cliente: Augusto Santos Lopes
  - Email: augustonanuque@gmail.com
  - Endereço: Rua Ponte Nova, N°11
  - Tabela com produto "Bracelete de Ouro para Teste"
  - Quantidade: 3
  - Preço: ₲12.222
  - Linha "bolsa personalizada": ₲150.000
  - Total de Guaraníes calculado
  - Total de Piezas: 3 unidades
- ✅ **Página 2: RELATÓRIO DE VENDA**
  - Cabeçalho destacado
  - Data da venda
  - Tabela de produtos vendidos:
    - Bracelete: 1 unidade vendida
    - Comissão: 9%
  - Resumo financeiro:
    - Peças enviadas: 3
    - Peças devolvidas: 2
    - Peças vendidas: 1
    - Valor das vendas: ₲12.222
    - Comissão total: ₲1.100 (aprox)

---

### Teste 4: Múltiplos Produtos

**Objetivo:** Validar PDF com muitos produtos

**Passos:**
1. Criar mostruário com 5+ produtos diferentes
2. Exportar PDF

**Resultado Esperado:**
- ✅ Tabela se ajusta automaticamente
- ✅ Todos os produtos listados
- ✅ Totais corretos
- ✅ Se necessário, quebra de página automática

---

### Teste 5: Tratamento de Erros

**Objetivo:** Validar mensagens de erro

**Passos:**
1. Modificar temporariamente o código para simular erro
2. OU tentar exportar mostruário inexistente

**Resultado Esperado:**
- ✅ Toast: "Erro ao gerar PDF. Tente novamente."
- ✅ Erro logado no console
- ✅ Aplicação não quebra

---

## 🔍 Validações Detalhadas

### Formatação de Moeda

**Verificar:**
- ✅ Símbolo: `₲` (Guarani)
- ✅ Separador de milhares: `.` (ponto)
- ✅ Exemplo: `₲1.234.567`
- ✅ Sem casas decimais (valores arredondados)

### Formatação de Data

**Verificar:**
- ✅ Formato: `dd/mm/yyyy`
- ✅ Exemplo: `27/10/2025`
- ✅ Locale: es-PY (Paraguai)

### Estrutura da Tabela

**Verificar:**
- ✅ Cabeçalho: "Código | Produto | [vazio] | Precio"
- ✅ Bordas pretas completas (grid)
- ✅ Alinhamento:
  - Código: Esquerda
  - Produto: Esquerda
  - Quantidade: Centro
  - Preço: Direita
- ✅ Linha de rodapé com totais em negrito

### Layout Geral

**Verificar:**
- ✅ Margens consistentes (15mm)
- ✅ Logo no canto superior esquerdo
- ✅ Título centralizado
- ✅ Linha de assinatura centralizada
- ✅ Rodapé com data de geração e sistema

---

## 🐛 Problemas Comuns e Soluções

### Problema 1: PDF não baixa

**Possíveis Causas:**
- Pop-ups bloqueados
- Permissões do navegador

**Solução:**
1. Verificar configurações de download do navegador
2. Permitir pop-ups para localhost
3. Verificar console para erros JavaScript

### Problema 2: Dados incorretos no PDF

**Possíveis Causas:**
- Dados incorretos no banco
- Query falhando

**Solução:**
1. Verificar dados no Supabase
2. Verificar console do navegador
3. Verificar logs do servidor

### Problema 3: Erro "Mostruário não encontrado"

**Possíveis Causas:**
- ID inválido
- Mostruário deletado
- Permissões RLS

**Solução:**
1. Verificar se mostruário existe
2. Verificar RLS no Supabase
3. Verificar autenticação do usuário

---

## 📊 Checklist de Validação

Use este checklist para cada teste:

### Dados do Mostruário
- [ ] Código correto (MST-XXXXX)
- [ ] Data de envio formatada
- [ ] Status correto

### Dados do Distribuidor
- [ ] Nome completo exibido
- [ ] Email correto
- [ ] Endereço (se disponível)
- [ ] C.I. (primeiros 12 caracteres do UUID)

### Tabela de Produtos
- [ ] Todos os produtos listados
- [ ] Códigos corretos
- [ ] Nomes corretos
- [ ] Quantidades corretas
- [ ] Preços formatados (₲)

### Totais
- [ ] Total de Guaraníes correto
- [ ] Total de Piezas correto
- [ ] Linha "bolsa personalizada" presente
- [ ] Somas matemáticas corretas

### Página de Venda (se aplicável)
- [ ] Página 2 criada
- [ ] Produtos vendidos listados
- [ ] Comissões calculadas corretamente
- [ ] Resumo financeiro correto

### Qualidade do PDF
- [ ] Layout profissional
- [ ] Texto legível
- [ ] Tabelas bem formatadas
- [ ] Sem sobreposições
- [ ] Metadados corretos

---

## 🎯 Casos de Teste Específicos

### Caso 1: Mostruário MST-00006 (Referência)

**Dados Esperados:**
```
Código: MST-00006
Cliente: Augusto Santos Lopes
Email: augustonanuque@gmail.com
Endereço: Rua Ponte Nova, N°11
C.I: f278254b-470

Produtos:
- 0788 | Bracelete de Ouro para Teste | 3 | ₲12.222

Venda:
- Vendido: 1 unidade
- Comissão: 9%
- Valor comissão: ₲1.100
```

### Caso 2: Mostruário Vazio (Edge Case)

**Cenário:**
- Mostruário sem produtos

**Resultado Esperado:**
- Tabela vazia ou mensagem apropriada
- PDF ainda gerado sem erros

### Caso 3: Nome Longo (Edge Case)

**Cenário:**
- Produto com nome muito longo
- Nome de distribuidor muito longo

**Resultado Esperado:**
- Texto quebrado corretamente
- Sem overflow da página

---

## 📈 Métricas de Performance

**Tempo de Geração Esperado:**
- Mostruário com 1-5 produtos: < 1 segundo
- Mostruário com 10+ produtos: < 2 segundos
- Mostruário com 50+ produtos: < 3 segundos

**Tamanho do Arquivo:**
- Página 1 apenas: 15-30 KB
- Páginas 1+2: 20-40 KB

---

## ✅ Aprovação Final

Após completar todos os testes, verifique:

- [ ] ✅ PDF gerado para mostruário entregue
- [ ] ✅ PDF gerado para mostruário finalizado sem venda
- [ ] ✅ PDF gerado para mostruário finalizado com venda
- [ ] ✅ Formatação de moeda correta
- [ ] ✅ Formatação de data correta
- [ ] ✅ Cálculos matemáticos corretos
- [ ] ✅ Layout profissional
- [ ] ✅ Download automático funciona
- [ ] ✅ Mensagens de erro apropriadas
- [ ] ✅ Performance aceitável

---

## 🚀 Próximos Passos

Após aprovação nos testes:

1. ✅ Marcar funcionalidade como **CONCLUÍDA**
2. ✅ Documentar em changelog
3. ⏳ Adicionar logo real da empresa (se disponível)
4. ⏳ Coletar feedback dos usuários
5. ⏳ Implementar melhorias sugeridas

---

**Data**: 27 de outubro de 2025  
**Testador**: _________________  
**Status**: ⏳ **AGUARDANDO TESTES**
