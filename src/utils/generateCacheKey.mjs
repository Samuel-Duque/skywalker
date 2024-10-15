
// Função para gerar a chave de cache da imagem
export function generateCacheKey(imageName, queryParams, formatImage) {
  const params = new URLSearchParams(queryParams);
  const [name] = imageName.split("."); // Separa o nome da imagem sem a extensão

  // Substitui caracteres especiais que não são permitidos em chaves do S3
  return `${name}${params.toString().replace(/[^a-zA-Z0-9_\-\.]/g, "_")}.${formatImage}`;
}