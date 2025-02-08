import DocumentIntelligence, {
  getLongRunningPoller,
  isUnexpected,
} from "@azure-rest/ai-document-intelligence";

const endpoint = process.env.NEXT_PUBLIC_DI_ENDPOINT!;
const apiKey = process.env.NEXT_PUBLIC_DI_KEY!;

const client = DocumentIntelligence(endpoint, { key: apiKey });

export async function extractReceiptData(imageBuffer: Buffer) {
  try {
    // Call Azure Document Intelligence with the prebuilt receipt model
    const initialResponse = await client
      .path("/documentModels/{modelId}:analyze", "prebuilt-receipt")
      .post({
        contentType: "application/octet-stream",
        body: imageBuffer,
      });

    if (isUnexpected(initialResponse)) {
      throw initialResponse.body.error;
    }

    // Wait for the processing to complete
    const poller = await getLongRunningPoller(client, initialResponse); // Add await here
    const analyzeResult = (await poller.pollUntilDone()).body.analyzeResult;

    if (!analyzeResult?.documents || analyzeResult.documents.length === 0) {
      throw new Error("No receipt data detected.");
    }

    const receipt = analyzeResult.documents[0].fields;

    let date = new Date();
    if (receipt.TransactionDate?.valueDate)
      date = new Date(receipt.TransactionDate?.valueDate);

    return {
      store: receipt.MerchantName?.valueString || "Unknown",
      date: date, // todays date,
      total: receipt.Total?.valueCurrency?.amount || 0,
      items:
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        receipt.Items?.valueArray?.map((item: any) => ({
          name: item.valueObject?.Description?.valueString || "Unknown Item",
          price: item.valueObject?.TotalPrice?.valueCurrency?.amount || 0,
          quantity: item.valueObject?.Quantity?.valueNumber || 1,
        })) || [],
    };
  } catch (error) {
    console.error("Error processing receipt:", error);
    return null;
  }
}
