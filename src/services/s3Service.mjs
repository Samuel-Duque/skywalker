import { s3Client, bucketName } from "../config/s3Client.mjs";
import { ListObjectsV2Command } from "@aws-sdk/client-s3";

// Função para listar os objetos que estão bucket S3
export async function listObjects() {
  const command = new ListObjectsV2Command({
    Bucket: bucketName,
  });

  try {
    const response = await s3Client.send(command);
    return response.Contents.map((item) => item.Key);
  } catch (error) {
    console.error("Erro ao listar objetos no bucket:", error);
    throw error;
  }
}
