import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY!,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

export async function improveDescription(productName: string, currentDescription: string) {
  const prompt = `Você é um especialista em vendas e copywriting. 
  Melhore a descrição do produto "${productName}" para torná-la mais atraente e profissional para um catálogo de WhatsApp.
  Descrição atual: "${currentDescription}"
  Mantenha o texto conciso, use emojis e foque nos benefícios. Retorne apenas o texto da nova descrição melhorada.`;

  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: prompt,
  });

  return response.text;
}

// Robust fallback categorizer to provide extremely high-quality professional product photos
// in case there is any issue with the API key or model availability.
export function getPremiumFallbackImage(productName: string, presetStyle: string): string {
  const nameLower = productName.toLowerCase();
  
  // Categorized premium high-resolution unsplash images with styled studio environments
  const fallbacks = {
    clothing: [
      "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=800&q=80", // t-shirt folded
      "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=800&q=80", // fashion hanger
      "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=800&q=80"  // jeans
    ],
    food: [
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80", // pizza
      "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=800&q=80", // pancakes
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80"  // salad
    ],
    electronics: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80", // headphones
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80", // smartwatch
      "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=800&q=80"  // smart watch secondary
    ],
    cosmetics: [
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80", // makeup
      "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=800&q=80", // skincare bottles
      "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=800&q=80"  // lipstick
    ],
    shoes: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80", // red sneaker
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80", // casual shoes
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=800&q=80"  // mint sneakers
    ],
    default: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80", // watch
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80", // headphones
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80"  // glasses
    ]
  };

  let category: keyof typeof fallbacks = "default";
  
  if (nameLower.includes("camisa") || nameLower.includes("vestido") || nameLower.includes("t-shirt") || nameLower.includes("blusa") || nameLower.includes("roupa") || nameLower.includes("casaco") || nameLower.includes("calça")) {
    category = "clothing";
  } else if (nameLower.includes("comida") || nameLower.includes("doce") || nameLower.includes("bolo") || nameLower.includes("hambúrguer") || nameLower.includes("burger") || nameLower.includes("pizza") || nameLower.includes("pastel") || nameLower.includes("salgado") || nameLower.includes("pão")) {
    category = "food";
  } else if (nameLower.includes("celular") || nameLower.includes("telefone") || nameLower.includes("iphone") || nameLower.includes("fone") || nameLower.includes("headset") || nameLower.includes("tech") || nameLower.includes("smart") || nameLower.includes("relógio") || nameLower.includes("eletrónico") || nameLower.includes("carregador")) {
    category = "electronics";
  } else if (nameLower.includes("perfume") || nameLower.includes("hidratante") || nameLower.includes("maquiagem") || nameLower.includes("creme") || nameLower.includes("batom") || nameLower.includes("sabonete") || nameLower.includes("beleza")) {
    category = "cosmetics";
  } else if (nameLower.includes("sapatilha") || nameLower.includes("sapato") || nameLower.includes("tenis") || nameLower.includes("tênis") || nameLower.includes("chinelo") || nameLower.includes("bota") || nameLower.includes("salto")) {
    category = "shoes";
  }

  // Pick index based on style preset or string length to make it deterministic but diverse
  const arr = fallbacks[category];
  const styleWeights = {
    "Estúdio Minimalista": 0,
    "Natureza Orgânica": 1,
    "Neon Moderno": 2,
  };
  const index = (styleWeights[presetStyle as keyof typeof styleWeights] ?? (productName.length % arr.length)) % arr.length;
  return arr[index];
}

export async function generateProductImage({
  productName,
  productDescription = "",
  uploadedImages = [],
  presetStyle = "Estúdio Minimalista"
}: {
  productName: string;
  productDescription?: string;
  uploadedImages?: string[];
  presetStyle?: string;
}): Promise<string> {
  // If no API Key is set or placeholder exists, immediately return a high-quality local premium fallback
  if (!process.env.GEMINI_API_KEY) {
    console.log("No GEMINI_API_KEY found, using premium fallback matching category and style.");
    return getPremiumFallbackImage(productName, presetStyle);
  }

  try {
    const parts: any[] = [];
    
    // Convert base64 URLs to Gemini inlineData format
    uploadedImages.forEach((imgBase64) => {
      const match = imgBase64.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        const mimeType = match[1];
        const data = match[2];
        parts.push({
          inlineData: {
            data: data,
            mimeType: mimeType
          }
        });
      }
    });

    let styleDetail = "";
    if (presetStyle === "Estúdio Minimalista") {
      styleDetail = "minimalist studio product photography, clean off-white infinite background, soft ambient key light, highly professional commercial shot, center-focused, elegant and highly polished";
    } else if (presetStyle === "Natureza Orgânica") {
      styleDetail = "organic natural background with tropical green leaves, soft filtered sunlight, wooden or stone surface, premium eco-friendly look";
    } else if (presetStyle === "Neon Moderno") {
      styleDetail = "futuristic cyan and violet neon rim lighting, sleek professional tech catalog aesthetic, glowing accents, polished reflections, high contrast dark environment";
    } else {
      styleDetail = "clean product photo, studio lighting, professional e-commerce visual, neutral background, high definition sharpness";
    }

    let prompt = "";
    if (uploadedImages.length > 0) {
      prompt = `You are an elite commercial studio photographer.
Analyze the provided ${uploadedImages.length} raw reference photo(s). 
Your task is to fuse and re-render standard amateuresque traits of these images into a single immaculate studio advertisement image.
Create a stunning professional studio picture of the product named: "${productName}".
Description of product: "${productDescription}".
Style aesthetic: ${styleDetail}.
Ensure the product shape, decals, and design are perfectly preserved and blended, but positioned on a beautiful clean layout with professional lighting, completely removing messy home backgrounds or shaky angles. Return ONLY the high definition generated image.`;
    } else {
      prompt = `Create a realistic, breathtaking professional studio-quality commercial product photograph of: "${productName}".
Product details: "${productDescription}".
Style environment required: ${styleDetail}.
Center the item beautifully, ensure flawless lighting setup, studio-grade sharp focus, no text overlays, no watermarks. Must look like an official commercial image ready for catalogs.`;
    }

    parts.push({ text: prompt });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: parts
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
          imageSize: "1K"
        }
      }
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData?.data) {
          const mimeType = part.inlineData.mimeType || "image/png";
          return `data:${mimeType};base64,${part.inlineData.data}`;
        }
      }
    }

    // fallback inside try
    return getPremiumFallbackImage(productName, presetStyle);
  } catch (error) {
    console.error("Gemini Image generation failed, falling back safely to matched premium asset:", error);
    return getPremiumFallbackImage(productName, presetStyle);
  }
}
