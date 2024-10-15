import { s3Client, bucketName } from "../config/s3Client.mjs";
import { getBestFormat } from "../utils/getBestFormat.mjs";
import { generateCacheKey } from "../utils/generateCacheKey.mjs";
import {
  GetObjectCommand,
  PutObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import sharp from "sharp";
import mime from "mime-types";

// Função para recuperar a imagem original do S3
async function getOriginalImageFromS3(imageName) {
  const originalImageKey = imageName;
  const getOriginalParams = {
    Bucket: bucketName,
    Key: originalImageKey,
  };
  return await getObjectBuffer(getOriginalParams);
}

// Função para aplicar transformações na imagem
async function applyTransformations(originalImageBuffer, queryParams, request) {
  let { fm, q = 85, w, h, gray } = queryParams;

  // Inicializa o formato da imagem
  let formatImage = fm;
  if (
    !formatImage ||
    !["webp", "jpg", "jpeg", "png"].includes(formatImage.toLowerCase())
  ) {
    formatImage = getBestFormat(request);
  }

  if (!["webp", "jpg", "jpeg", "png"].includes(formatImage.toLowerCase())) {
    throw new Error(`Formato de imagem não suportado: ${formatImage}`);
  }

  console.log("Formato da imagem:", formatImage);

  let image = sharp(originalImageBuffer);

  if (w || h) {
    image = image.resize(parseInt(w) || null, parseInt(h) || null);
  }

  if (gray === "1") {
    image = image.grayscale();
  }

  const qualityImage = parseInt(q);

  image = image.toFormat(formatImage, { quality: qualityImage });
  const processedImageBuffer = await image.toBuffer();
  return { processedImageBuffer, formatImage };
}

// Função para armazenar a imagem processada no S3
async function storeProcessedImageInS3(
  imageBuffer,
  processedImageKey,
  formatImage
) {
  if (!["webp", "jpg", "jpeg", "png"].includes(formatImage)) {
    throw new Error(`Formato de imagem não suportado: ${formatImage}`);
  }

  const ContentType = mime.lookup(formatImage) || "application/octet-stream";
  const putParams = {
    Bucket: bucketName,
    Key: processedImageKey,
    Body: imageBuffer,
    ContentType,
    CacheControl: "max-age=31536000", // Cache por 1 ano
  };

  await s3Client.send(new PutObjectCommand(putParams));
}

export async function processImage(imageName, queryParams, request) {
  try {
    // Recupera a imagem original do S3
    const originalImageBuffer = await getOriginalImageFromS3(imageName);

    // Aplica as transformações na imagem
    const { processedImageBuffer, formatImage } = await applyTransformations(
      originalImageBuffer,
      queryParams,
      request
    );

    const cacheKey = generateCacheKey(imageName, queryParams, formatImage);
    const processedImageKey = `${cacheKey}`;

    // Verifica se a imagem já foi processada e está armazenada no S3
    try {
      const headParams = {
        Bucket: bucketName,
        Key: processedImageKey,
      };
      await s3Client.send(new HeadObjectCommand(headParams));
    } catch {
      console.log(
        "A imagem processada não existe no S3. Processando a imagem..."
      );

      // Armazena a imagem processada no S3
      await storeProcessedImageInS3(
        processedImageBuffer,
        processedImageKey,
        formatImage
      );
    }

    // Retorna a URL do CloudFront para a imagem processada
    const cloudFrontDomain = process.env.CLOUDFRONT_DOMAIN;
    return `https://${cloudFrontDomain}/${processedImageKey}`;
  } catch (error) {
    console.error("Erro ao processar imagem:", error);
    throw error;
  }
}

async function getObjectBuffer(getParams) {
  const command = new GetObjectCommand(getParams);
  const response = await s3Client.send(command); // Executa o comando para obter o objeto do S3 (imagem)
  const chunks = []; // Array para armazenar os pedaços da imagem
  for await (const chunk of response.Body) {
    chunks.push(chunk); // Adiciona os pedaços da imagem no array
  }
  return Buffer.concat(chunks); // Retorna o buffer da imagem
}

// Função para fazer upload da imagem original no S3
export async function uploadOriginalImage(fileBuffer, fileName, mimetype) {
  const putParams = {
    Bucket: bucketName,
    Key: fileName,
    Body: fileBuffer,
    ContentType: mimetype,
  };

  console.log(
    "Carregando imagem com a chave:",
    fileName,
    "no bucket:",
    bucketName
  );

  await s3Client.send(new PutObjectCommand(putParams));
}
