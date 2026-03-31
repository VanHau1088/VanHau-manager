import { Router } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";

const router = Router();

router.post("/api/ai/evaluate-camp", async (req, res) => {
  try {
    const {
      page, product, date,
      totalBudget, totalSpend, sodon,
      cpa, cpaTarget,
      cpc, ctr, cpm,
      note,
    } = req.body;

    const cpaNum = parseFloat(cpa) || 0;
    const cpaTargetNum = parseFloat(cpaTarget) || 0;
    const cpcNum = parseFloat(cpc) || 0;
    const ctrNum = parseFloat(ctr) || 0;
    const cpmNum = parseFloat(cpm) || 0;

    const prompt = `Bạn là chuyên gia quảng cáo Facebook Ads. Hãy đánh giá hiệu suất camp quảng cáo sau và đưa ra lời khuyên ngắn gọn, thực tế bằng tiếng Việt.

Thông tin camp:
- Ngày: ${date || "N/A"}
- Page: ${page || "N/A"}
- Sản phẩm: ${product || "N/A"}
- Tổng ngân sách: ${totalBudget || "N/A"}
- Tổng chi tiêu: ${totalSpend || "N/A"}
- Số đơn: ${sodon || 0}
- CPA thực tế: ${cpaNum.toLocaleString("vi-VN")}đ
- CPA Target: ${cpaTargetNum ? cpaTargetNum.toLocaleString("vi-VN") + "đ" : "Chưa đặt"}
- CPC: ${cpcNum.toLocaleString("vi-VN")}đ
- CTR: ${ctrNum}%
- CPM: ${cpmNum.toLocaleString("vi-VN")}đ
- Ghi chú: ${note || "Không có"}

Hãy đánh giá theo cấu trúc:
1. **Tổng quan**: Camp đang ở trạng thái gì (tốt/trung bình/kém)?
2. **Phân tích chỉ số**: Nhận xét về CPC, CTR, CPM, CPA so với mức trung bình ngành (Facebook Ads VN)
3. **Điểm mạnh**: Liệt kê điểm tốt của camp
4. **Điểm cần cải thiện**: Vấn đề cần khắc phục
5. **Lời khuyên cụ thể**: 2-3 hành động cần làm ngay

Trả lời ngắn gọn, thực tế, không dài dòng.`;

    const response = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const advice = response.choices[0]?.message?.content || "Không thể phân tích lúc này.";
    res.json({ advice });
  } catch (err) {
    console.error("AI evaluate error:", err);
    res.status(500).json({ error: "Lỗi khi phân tích camp. Vui lòng thử lại." });
  }
});

export default router;
