import { OpenAIStream } from "@/utils";

const API_KEY = process.env.OPENAI_API_KEY!;

export const config = {
  runtime: "edge"
};

const handler = async (req: Request): Promise<Response> => {
  try {
    const { prompt, apiKey } = (await req.json()) as {
      prompt: string;
      apiKey: string;
    };
    
    const stream = await OpenAIStream(prompt, apiKey || API_KEY);

    return new Response(stream);
  } catch (error) {
    console.error(error);
    return new Response("Error", { status: 500 });
  }
};

export default handler;
