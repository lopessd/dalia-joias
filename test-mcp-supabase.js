// Teste da configuração MCP Supabase
const { spawn } = require('child_process');
const path = require('path');

console.log('🧪 Testando configuração MCP Supabase...');

// Configurações do ambiente
const env = {
  ...process.env,
  SUPABASE_URL: 'https://eelizogeyrjjrfrximif.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlbGl6b2dleXJqanJmcnhpbWlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5MDIzODIsImV4cCI6MjA3MTQ3ODM4Mn0.AgGDCGfbpioweMa4IrE8O6P2lJ6bAbgFquFnE9CudzM',
  SUPABASE_SERVICE_ROLE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlbGl6b2dleXJqanJmcnhpbWlmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTkwMjM4MiwiZXhwIjoyMDcxNDc4MzgyfQ._qr5Y795Rida_GaJa0y4K24ns5wiqmzu6T6f_PMblfc',
  SUPABASE_ACCESS_TOKEN: 'sbp_21c415462204d6fb25bd8f70f50d95a9e324f2a3'
};

console.log('✅ Variáveis de ambiente configuradas:');
console.log('- SUPABASE_URL:', env.SUPABASE_URL ? '✅ Configurado' : '❌ Não configurado');
console.log('- SUPABASE_ANON_KEY:', env.SUPABASE_ANON_KEY ? '✅ Configurado' : '❌ Não configurado');
console.log('- SUPABASE_SERVICE_ROLE_KEY:', env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Configurado' : '❌ Não configurado');
console.log('- SUPABASE_ACCESS_TOKEN:', env.SUPABASE_ACCESS_TOKEN ? '✅ Configurado' : '❌ Não configurado');

console.log('\n🔧 Testando servidor MCP Supabase...');

// Simular uma mensagem MCP para testar a conexão
const testMessage = {
  jsonrpc: '2.0',
  id: 1,
  method: 'initialize',
  params: {
    protocolVersion: '2024-11-05',
    capabilities: {
      tools: {}
    },
    clientInfo: {
      name: 'test-client',
      version: '1.0.0'
    }
  }
};

// Executar o servidor MCP
const mcpProcess = spawn('npx', ['@supabase/mcp-server-supabase@latest'], {
  env: env,
  stdio: ['pipe', 'pipe', 'pipe']
});

let output = '';
let errorOutput = '';

mcpProcess.stdout.on('data', (data) => {
  output += data.toString();
});

mcpProcess.stderr.on('data', (data) => {
  errorOutput += data.toString();
});

// Enviar mensagem de inicialização
setTimeout(() => {
  console.log('📤 Enviando mensagem de inicialização...');
  mcpProcess.stdin.write(JSON.stringify(testMessage) + '\n');
}, 1000);

// Timeout para o teste
setTimeout(() => {
  console.log('\n📊 Resultado do teste:');
  
  if (output) {
    console.log('✅ Servidor MCP respondeu:');
    console.log(output);
  } else {
    console.log('⚠️  Nenhuma resposta do servidor MCP');
  }
  
  if (errorOutput) {
    console.log('❌ Erros encontrados:');
    console.log(errorOutput);
  }
  
  mcpProcess.kill();
  
  console.log('\n🎯 Conclusão:');
  if (output && !errorOutput.includes('Error')) {
    console.log('✅ MCP Supabase configurado corretamente!');
    console.log('✅ O agente pode agora acessar o banco de dados Supabase');
  } else {
    console.log('⚠️  Configuração pode precisar de ajustes');
    console.log('💡 Verifique as variáveis de ambiente e permissões');
  }
  
  process.exit(0);
}, 5000);

mcpProcess.on('error', (error) => {
  console.error('❌ Erro ao executar servidor MCP:', error.message);
  process.exit(1);
});

console.log('⏳ Aguardando resposta do servidor MCP (5 segundos)...');