// Teste simples para upload de imagens
const testUpload = async () => {
  try {
    // Criar um arquivo de teste (1x1 pixel PNG transparente)
    const testImageData = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
    const binaryString = atob(testImageData);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    const file = new File([bytes], 'test.png', { type: 'image/png' });
    
    // Criar FormData
    const formData = new FormData();
    formData.append('file', file);
    
    // Fazer upload
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    console.log('Resultado do teste:', result);
    
    if (response.ok) {
      console.log('✅ Upload funcionando!');
      console.log('URL da imagem:', result.url);
    } else {
      console.error('❌ Erro no upload:', result.error);
      console.error('Detalhes:', result.details);
    }
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
};

// Para executar no console do navegador
console.log('Para testar o upload, execute: testUpload()');
window.testUpload = testUpload;
