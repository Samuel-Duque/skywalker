// Função para obter o melhor formato de imagem com base no cabeçalho Accept
export function getBestFormat(request) {
  const acceptHeader = request.headers["accept"] || "";
  if (acceptHeader.includes("image/webp")) {
    return "webp";
  } else if (acceptHeader.includes("image/jpg")) {
    return "jpg";
  } else if (acceptHeader.includes("image/jpeg")) {
    return "jpeg";
  } else {
    return "png";
  }
}
