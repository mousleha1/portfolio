import { Router } from "express";
import nodemailer from "nodemailer";
import ExcelJS from "exceljs";
import { db, submissionsTable } from "@workspace/db";
import { desc } from "drizzle-orm";

const router = Router();

const serviceLabels: Record<string, string> = {
  "landing-page": "تصميم صفحات الهبوط",
  "store-optimization": "تهيئة وتحسين متاجر سلة",
  "content-writing": "كتابة المحتوى",
  "cv-writing": "إعداد السيرة الذاتية",
  other: "أخرى",
};

router.post("/contact", async (req, res) => {
  const { name, email, phone, service, message } = req.body as {
    name?: string;
    email?: string;
    phone?: string;
    service?: string;
    message?: string;
  };

  if (!name?.trim() || !service?.trim() || !message?.trim()) {
    res.status(400).json({ error: "يرجى تعبئة الاسم ونوع الخدمة والرسالة." });
    return;
  }

  const gmailUser = process.env.GMAIL_USER?.trim();
  const gmailPass = process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, "").trim();

  if (!gmailUser || !gmailPass) {
    res.status(503).json({ error: "لم يتم ضبط إعدادات البريد الإلكتروني بعد." });
    return;
  }

  const serviceLabel = serviceLabels[service] ?? service;

  const htmlBody = `
    <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #f1f5f9; border-radius: 12px; padding: 32px;">
      <h2 style="color: #c9a84c; margin-top: 0; border-bottom: 1px solid #334155; padding-bottom: 16px;">
        🌟 طلب جديد من موقع حلها بسيط
      </h2>

      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <tr>
          <td style="padding: 10px 0; color: #94a3b8; width: 150px; vertical-align: top;">👤 الاسم:</td>
          <td style="padding: 10px 0; font-weight: bold;">${name.trim()}</td>
        </tr>
        ${
          email?.trim()
            ? `<tr>
          <td style="padding: 10px 0; color: #94a3b8; vertical-align: top;">📧 البريد:</td>
          <td style="padding: 10px 0;">${email.trim()}</td>
        </tr>`
            : ""
        }
        ${
          phone?.trim()
            ? `<tr>
          <td style="padding: 10px 0; color: #94a3b8; vertical-align: top;">📱 رقم التواصل:</td>
          <td style="padding: 10px 0; direction: ltr; text-align: right;">${phone.trim()}</td>
        </tr>`
            : ""
        }
        <tr>
          <td style="padding: 10px 0; color: #94a3b8; vertical-align: top;">🛠️ الخدمة:</td>
          <td style="padding: 10px 0; font-weight: bold; color: #c9a84c;">${serviceLabel}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #94a3b8; vertical-align: top;">📝 التفاصيل:</td>
          <td style="padding: 10px 0; white-space: pre-wrap; line-height: 1.6;">${message.trim()}</td>
        </tr>
      </table>

      <p style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #334155; color: #64748b; font-size: 12px;">
        تم إرسال هذا الطلب تلقائياً من نموذج التواصل على موقع حلها بسيط للخدمات الإلكترونية.
      </p>
    </div>
  `;

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: gmailUser, pass: gmailPass },
    });

    await transporter.sendMail({
      from: `"حلها بسيط" <${gmailUser}>`,
      to: gmailUser,
      subject: `طلب جديد - ${serviceLabel} | ${name.trim()}`,
      html: htmlBody,
    });
  } catch (err) {
    console.error("Email send error:", err);
    res.status(500).json({ error: "حدث خطأ أثناء إرسال البريد الإلكتروني." });
    return;
  }

  try {
    await db.insert(submissionsTable).values({
      name: name.trim(),
      email: email?.trim() || null,
      phone: phone?.trim() || null,
      service: service.trim(),
      message: message.trim(),
    });
  } catch (err) {
    console.error("DB insert error:", err);
  }

  res.json({ success: true });
});

router.get("/contact/export", async (req, res) => {
  const exportKey = process.env.EXPORT_SECRET_KEY;
  if (exportKey && req.query.key !== exportKey) {
    res.status(401).json({ error: "غير مصرح." });
    return;
  }

  const rows = await db
    .select()
    .from(submissionsTable)
    .orderBy(desc(submissionsTable.createdAt));

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "حلها بسيط للخدمات الإلكترونية";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("الطلبات", {
    views: [{ rightToLeft: true }],
  });

  sheet.columns = [
    { header: "#", key: "id", width: 6 },
    { header: "الاسم", key: "name", width: 22 },
    { header: "البريد الإلكتروني", key: "email", width: 28 },
    { header: "رقم التواصل", key: "phone", width: 20 },
    { header: "الخدمة المطلوبة", key: "service", width: 28 },
    { header: "تفاصيل الطلب", key: "message", width: 50 },
    { header: "التاريخ", key: "createdAt", width: 22 },
  ];

  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 12 };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFC9A84C" },
  };
  headerRow.alignment = { horizontal: "center", vertical: "middle" };
  headerRow.height = 24;

  rows.forEach((row, i) => {
    const dataRow = sheet.addRow({
      id: row.id,
      name: row.name,
      email: row.email ?? "",
      phone: row.phone ?? "",
      service: serviceLabels[row.service] ?? row.service,
      message: row.message,
      createdAt: new Date(row.createdAt).toLocaleString("ar-SA", {
        timeZone: "Asia/Riyadh",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
    });
    dataRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: i % 2 === 0 ? "FFF8F4E8" : "FFFFFFFF" },
    };
    dataRow.alignment = { vertical: "top", wrapText: true };
  });

  sheet.autoFilter = { from: "A1", to: "G1" };

  const date = new Date().toISOString().slice(0, 10);
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", `attachment; filename="halha-basit-submissions-${date}.xlsx"; filename*=UTF-8''%D8%B7%D9%84%D8%A8%D8%A7%D8%AA-${date}.xlsx`);

  await workbook.xlsx.write(res);
  res.end();
});

export default router;
