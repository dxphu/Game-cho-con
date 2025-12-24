
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getDentalTips = async () => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Hãy đưa ra 3 lời khuyên ngắn gọn, vui nhộn và dễ hiểu về việc đánh răng dành cho trẻ em 5 tuổi bằng tiếng Việt.",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              content: { type: Type.STRING }
            },
            required: ["title", "content"]
          }
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Error fetching tips:", error);
    return [
      { title: "Đánh răng 2 lần", content: "Sáng khi thức dậy và tối trước khi đi ngủ nhé!" },
      { title: "Chải thật kỹ", content: "Chải mặt ngoài, mặt trong và cả mặt nhai nữa." },
      { title: "Ăn ít kẹo thôi", content: "Kẹo ngọt làm các bạn vi khuẩn thích lắm đó!" }
    ];
  }
};

export const getToySortingTips = async () => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Hãy đưa ra 3 lời khuyên ngắn gọn, vui nhộn về việc dọn dẹp đồ chơi sau khi chơi xong dành cho bé 5 tuổi bằng tiếng Việt.",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              content: { type: Type.STRING }
            },
            required: ["title", "content"]
          }
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    return [
      { title: "Bạn đồ chơi muốn về nhà", content: "Sau khi chơi xong, hãy đưa các bạn ấy về hòm để nghỉ ngơi nhé!" },
      { title: "Phòng sạch bé ngoan", content: "Phòng ngăn nắp giúp bé tìm đồ chơi nhanh hơn vào lần sau." },
      { title: "Giúp đỡ bố mẹ", content: "Tự dọn đồ chơi là bé đã giúp bố mẹ rất nhiều rồi đó!" }
    ];
  }
};

export const getPlantCareTips = async () => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Hãy đưa ra 3 lời khuyên ngắn gọn, vui nhộn về việc chăm sóc cây xanh và bảo vệ môi trường dành cho bé 5 tuổi bằng tiếng Việt.",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              content: { type: Type.STRING }
            },
            required: ["title", "content"]
          }
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    return [
      { title: "Cây cũng cần uống nước", content: "Đừng quên tưới nước để các bạn cây không bị khát nhé!" },
      { title: "Lá phổi xanh", content: "Cây giúp không khí trong lành hơn cho bé hít thở đấy." },
      { title: "Yêu quý thiên nhiên", content: "Không bẻ cành, hái hoa để cây luôn xinh đẹp bé nhé!" }
    ];
  }
};

export const getCelebrationMessage = async (playerName: string, gameType: string = 'dental') => {
  let context = "";
  switch(gameType) {
    case 'dental': context = "hoàn thành xuất sắc việc đánh răng sạch sẽ"; break;
    case 'toys': context = "dọn dẹp đồ chơi thật ngăn nắp"; break;
    case 'plants': context = "chăm sóc cây xanh lớn nhanh rực rỡ"; break;
  }
  
  const prompt = `Hãy viết 1 câu chúc mừng ngắn gọn, khen ngợi bé tên là ${playerName} đã ${context}. Giọng văn vui vẻ, dùng nhiều sticker.`;
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    return `Hoan hô ${playerName}! Con thật là một em bé tuyệt vời! ✨🌱`;
  }
};
