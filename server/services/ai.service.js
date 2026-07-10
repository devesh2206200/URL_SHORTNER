import Groq from "groq-sdk";


const generateUrlInsights = async (url) => {

    const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

    const prompt = `
Analyze the following URL:

${url}

If you recognize the website/domain, return information about it.

If you don't recognize it, infer the likely category from the URL.

Return ONLY valid JSON in this format:

{
  "category": "",
  "summary": "",
  "audience": "",
  "confidence": ""
}

Rules:
- summary must be less than 25 words.
- confidence must be Low, Medium or High.
- Do not include markdown.
- Do not explain anything.
`;

    try {
        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            temperature: 0.2,
            response_format: {
                type: "json_object",
            },
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
        });

        return JSON.parse(
            completion.choices[0].message.content
        );
    } catch (error) {
        console.error("Groq Error:", error.message);

        return {
            category: "Unknown",
            summary: "Unable to analyze this URL.",
            audience: "Unknown",
            confidence: "Low",
        };
    }
};

export { generateUrlInsights };