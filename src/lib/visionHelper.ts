import vision from "@google-cloud/vision";

const extractTextFromImage = async (imageBuffer: Buffer) => {
  const client = new vision.ImageAnnotatorClient({
    credentials: JSON.parse(
      process.env.GOOGLE_CLOUD_VISION_CREDENTIALS || "{}"
    ),
  });

  const [result] = await client.textDetection({
    image: { content: imageBuffer },
  });

  if (!result.textAnnotations) {
    return "";
  }
  const text =
    result.textAnnotations.length > 0
      ? result.textAnnotations[0].description
      : "";

  return text;
};

export default extractTextFromImage;
