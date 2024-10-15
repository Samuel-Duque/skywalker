import {
  processImage,
  uploadOriginalImage,
} from "../services/imageService.mjs";
import { listObjects } from "../services/s3Service.mjs";

export async function getImage(request, response) {
  try {
    const imageName = request.params.imageName;
    const imagePath = request.path;
    const queryParams = request.query;

    console.log("Recuperando imagem com a chave:", imageName);

    if (imagePath === "/" || imagePath === "") {
      return response.status(400).send("Bad Request: Image path is missing.");
    }

    // Obtem a URL do CloudFront em vez do buffer da imagem
    const cloudFrontUrl = await processImage(imageName, queryParams, request);

    response.set("Cache-Control", "no-store");

    // Retorna a URL do CloudFront para o cliente
    response.end(JSON.stringify({ url: cloudFrontUrl }));
  } catch (error) {
    console.error("Erro no controlador getImage:", error);
    // Imagem não encontrada
    response.status(404).send("Image not found.");
  }
}

export async function uploadImage(request, response) {
  try {
    const file = request.file;
    console.log("Recebendo imagem para upload:", file);

    if (!file) {
      return response.status(400).send("No image file provided.");
    }

    const fileName = file.originalname;
    const fileBuffer = file.buffer;
    const mimetype = file.mimetype;

    await uploadOriginalImage(fileBuffer, fileName, mimetype);

    response.status(200).send("Image uploaded successfully.");
  } catch (error) {
    console.error("Erro no controlador uploadImage:", error);
    response.status(500).send("Internal Server Error");
  }
}

// Novo controlador para listar imagens
export async function listImages(request, response) {
  try {
    const objects = await listObjects();
    response.status(200).json(objects);
  } catch (error) {
    console.error("Erro no controlador listImages:", error);
    response.status(500).send("Internal Server Error");
  }
}
