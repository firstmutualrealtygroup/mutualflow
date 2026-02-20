const brandColor = "#2563eb";
const brandName = "First Mutual Realty Group";

function baseTemplate(content: string): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>First Mutual Realty Group</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Inter,Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          <!-- Header -->
          <tr>
            <td style="background:${brandColor};border-radius:16px 16px 0 0;padding:28px 32px;text-align:center;">
              <img src="https://via.placeholder.com/48x48/ffffff/2563eb?text=M"
                   alt="MutualFlow" width="48" height="48"
                   style="border-radius:12px;margin-bottom:12px;" />
              <p style="margin:0;color:white;font-size:20px;font-weight:700;">MutualFlow</p>
              <p style="margin:4px 0 0;color:rgba(255,255,255,0.8);font-size:12px;">${brandName}</p>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="background:white;padding:32px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;border-radius:0 0 16px 16px;padding:20px 32px;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="margin:0;color:#9ca3af;font-size:12px;">${brandName}</p>
              <p style="margin:4px 0 0;color:#9ca3af;font-size:11px;">
                This email was sent to you because you are working with one of our agents.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function stageRoadmap(currentStage: string): string {
  const stages = [
    { key: "DUE_DILIGENCE", label: "Due Diligence", icon: "🔍" },
    { key: "APPRAISAL", label: "Appraisal", icon: "📊" },
    { key: "LOAN_CONTINGENCY", label: "Loan Approval", icon: "🏦" },
    { key: "CLOSE_OF_ESCROW", label: "Close of Escrow", icon: "🎉" },
  ];
  const currentIdx = stages.findIndex((s) => s.key === currentStage);

  const stagesHtml = stages
    .map((s, i) => {
      const isDone = i < currentIdx;
      const isCurrent = i === currentIdx;
      const bg = isDone ? "#d1fae5" : isCurrent ? brandColor : "#f3f4f6";
      const color = isDone ? "#065f46" : isCurrent ? "white" : "#9ca3af";
      const labelColor = isDone ? "#065f46" : isCurrent ? brandColor : "#9ca3af";
      return `
        <td style="text-align:center;padding:0 8px;vertical-align:top;width:25%;">
          <div style="width:44px;height:44px;background:${bg};border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin:0 auto;font-size:18px;line-height:44px;">
            ${isDone ? "✓" : s.icon}
          </div>
          <p style="margin:8px 0 0;font-size:11px;color:${labelColor};font-weight:${isCurrent ? "700" : "400"};">
            ${s.label}
          </p>
          ${isCurrent ? `<p style="margin:2px 0 0;font-size:10px;color:${brandColor};font-weight:600;">← You are here</p>` : ""}
        </td>`;
    })
    .join(`
      <td style="vertical-align:middle;padding-bottom:24px;">
        <div style="height:2px;background:${currentIdx > 0 ? "#d1fae5" : "#e5e7eb"};"></div>
      </td>`);

  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;background:#f9fafb;border-radius:12px;padding:20px;">
      <tr>
        ${stagesHtml}
      </tr>
    </table>`;
}

export function dueDiligenceEmail(params: {
  clientName: string;
  agentName: string;
  propertyAddress: string;
  agentPhone?: string;
  agentEmail?: string;
}): { subject: string; html: string } {
  const subject = `🎉 Congratulations! Your Offer Has Been Accepted — What Happens Next`;
  const html = baseTemplate(`
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#111827;">
      Congratulations, ${params.clientName}! 🎉
    </h1>
    <p style="margin:0 0 24px;color:#6b7280;font-size:15px;">
      Your offer on <strong>${params.propertyAddress}</strong> has been accepted!
      We are absolutely thrilled for you and are committed to making this journey as smooth as possible.
    </p>

    <p style="margin:0 0 16px;color:#374151;font-size:14px;">
      There are <strong>4 stages</strong> to complete before you receive the keys to your new home.
      Here is where you stand right now:
    </p>

    ${stageRoadmap("DUE_DILIGENCE")}

    <div style="background:#eff6ff;border-left:4px solid ${brandColor};border-radius:4px;padding:16px 20px;margin:24px 0;">
      <h2 style="margin:0 0 8px;font-size:16px;font-weight:700;color:#1e40af;">
        Stage 1: Due Diligence Period 🔍
      </h2>
      <p style="margin:0;color:#1e3a8a;font-size:13px;line-height:1.6;">
        This is your opportunity to inspect the property and be <strong>100% satisfied</strong> with
        its condition. We will arrange professional inspections of the home. If we discover any items
        that may impact the habitability of the property, we have the opportunity to <strong>renegotiate
        with the seller</strong> before moving forward.
      </p>
    </div>

    <p style="margin:0 0 8px;color:#374151;font-size:14px;">
      <strong>What to expect during this stage:</strong>
    </p>
    <ul style="margin:0 0 24px;padding-left:20px;color:#6b7280;font-size:13px;line-height:1.8;">
      <li>Home inspection will be scheduled within the next few days</li>
      <li>We will review the inspection report together</li>
      <li>Any repairs or credits will be negotiated with the seller</li>
      <li>Your satisfaction is our top priority</li>
    </ul>

    <p style="margin:0 0 24px;color:#374151;font-size:14px;">
      We are with you every step of the way. Please do not hesitate to reach out with any questions!
    </p>

    <div style="background:#f9fafb;border-radius:12px;padding:16px 20px;margin:24px 0;">
      <p style="margin:0;color:#6b7280;font-size:13px;"><strong>Your Agent:</strong> ${params.agentName}</p>
      ${params.agentPhone ? `<p style="margin:4px 0 0;color:#6b7280;font-size:13px;">📞 ${params.agentPhone}</p>` : ""}
      ${params.agentEmail ? `<p style="margin:4px 0 0;color:#6b7280;font-size:13px;">✉️ ${params.agentEmail}</p>` : ""}
    </div>

    <p style="margin:0;color:#9ca3af;font-size:12px;text-align:center;">
      With excitement, The ${brandName} Team
    </p>
  `);
  return { subject, html };
}

export function appraisalEmail(params: {
  clientName: string;
  agentName: string;
  propertyAddress: string;
  purchasePrice?: number;
  agentPhone?: string;
  agentEmail?: string;
}): { subject: string; html: string } {
  const subject = `Stage 2: Appraisal Contingency — Your Transaction Update`;
  const html = baseTemplate(`
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#111827;">
      Great News, ${params.clientName}! 📊
    </h1>
    <p style="margin:0 0 24px;color:#6b7280;font-size:15px;">
      You have successfully completed the Due Diligence period. Now we move to the
      <strong>Appraisal Contingency</strong> stage!
    </p>

    ${stageRoadmap("APPRAISAL")}

    <div style="background:#f5f3ff;border-left:4px solid #7c3aed;border-radius:4px;padding:16px 20px;margin:24px 0;">
      <h2 style="margin:0 0 8px;font-size:16px;font-weight:700;color:#5b21b6;">
        Stage 2: Appraisal Contingency 📊
      </h2>
      <p style="margin:0;color:#4c1d95;font-size:13px;line-height:1.6;">
        A licensed appraiser will visit the property to confirm that the <strong>purchase price
        ${params.purchasePrice ? `of $${params.purchasePrice.toLocaleString()}` : ""} is aligned
        with the property&apos;s market value</strong>. This protects you as a buyer.
      </p>
    </div>

    <p style="margin:0 0 8px;color:#374151;font-size:14px;"><strong>Two possible outcomes:</strong></p>
    <div style="display:grid;gap:12px;margin:0 0 24px;">
      <div style="background:#d1fae5;border-radius:8px;padding:12px 16px;">
        <p style="margin:0;color:#065f46;font-size:13px;">
          ✅ <strong>If the appraisal matches or exceeds the purchase price:</strong><br/>
          We move forward to Stage 3 — Loan Approval!
        </p>
      </div>
      <div style="background:#fee2e2;border-radius:8px;padding:12px 16px;">
        <p style="margin:0;color:#991b1b;font-size:13px;">
          ⚠️ <strong>If the appraisal comes in below the purchase price:</strong><br/>
          We pause and renegotiate the purchase price with the seller.
        </p>
      </div>
    </div>

    <div style="background:#f9fafb;border-radius:12px;padding:16px 20px;margin:24px 0;">
      <p style="margin:0;color:#6b7280;font-size:13px;"><strong>Your Agent:</strong> ${params.agentName}</p>
      ${params.agentPhone ? `<p style="margin:4px 0 0;color:#6b7280;font-size:13px;">📞 ${params.agentPhone}</p>` : ""}
      ${params.agentEmail ? `<p style="margin:4px 0 0;color:#6b7280;font-size:13px;">✉️ ${params.agentEmail}</p>` : ""}
    </div>
  `);
  return { subject, html };
}

export function loanContingencyEmail(params: {
  clientName: string;
  agentName: string;
  propertyAddress: string;
  agentPhone?: string;
  agentEmail?: string;
}): { subject: string; html: string } {
  const subject = `Stage 3: Loan Contingency — Final Loan Approval`;
  const html = baseTemplate(`
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#111827;">
      Almost There, ${params.clientName}! 🏦
    </h1>
    <p style="margin:0 0 24px;color:#6b7280;font-size:15px;">
      The appraisal is complete and we are now entering the <strong>Loan Contingency</strong> stage
      — the final major hurdle before closing!
    </p>

    ${stageRoadmap("LOAN_CONTINGENCY")}

    <div style="background:#fff7ed;border-left:4px solid #ea580c;border-radius:4px;padding:16px 20px;margin:24px 0;">
      <h2 style="margin:0 0 8px;font-size:16px;font-weight:700;color:#9a3412;">
        Stage 3: Loan Contingency 🏦
      </h2>
      <p style="margin:0;color:#7c2d12;font-size:13px;line-height:1.6;">
        We are ensuring that your loan is <strong>fully approved by the underwriter</strong>.
        The underwriter will review all remaining conditions on your loan file. We do not
        anticipate any major issues — it is just a matter of satisfying all outstanding
        conditions to get you the green light!
      </p>
    </div>

    <p style="margin:0 0 8px;color:#374151;font-size:14px;"><strong>Action items for you:</strong></p>
    <ul style="margin:0 0 24px;padding-left:20px;color:#6b7280;font-size:13px;line-height:1.8;">
      <li>Respond promptly to any document requests from your lender</li>
      <li>Avoid making any large purchases or new credit applications</li>
      <li>Keep your employment and financial situation stable</li>
      <li>Be available for any questions from the underwriter</li>
    </ul>

    <p style="margin:0 0 24px;color:#374151;font-size:14px;">
      Once the loan is fully approved, we will move to the final and most exciting stage —
      <strong>Close of Escrow!</strong> 🎉
    </p>

    <div style="background:#f9fafb;border-radius:12px;padding:16px 20px;margin:24px 0;">
      <p style="margin:0;color:#6b7280;font-size:13px;"><strong>Your Agent:</strong> ${params.agentName}</p>
      ${params.agentPhone ? `<p style="margin:4px 0 0;color:#6b7280;font-size:13px;">📞 ${params.agentPhone}</p>` : ""}
      ${params.agentEmail ? `<p style="margin:4px 0 0;color:#6b7280;font-size:13px;">✉️ ${params.agentEmail}</p>` : ""}
    </div>
  `);
  return { subject, html };
}

export function closeOfEscrowEmail(params: {
  clientName: string;
  agentName: string;
  propertyAddress: string;
  closingDate?: string;
  agentPhone?: string;
  agentEmail?: string;
}): { subject: string; html: string } {
  const subject = `🎊 Time to Celebrate — Close of Escrow!`;
  const html = baseTemplate(`
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#111827;">
      Congratulations, ${params.clientName}! 🎊🏠
    </h1>
    <p style="margin:0 0 24px;color:#6b7280;font-size:15px;">
      You have made it to the final stage — <strong>Close of Escrow</strong>!
      This is the moment we have all been working toward.
    </p>

    ${stageRoadmap("CLOSE_OF_ESCROW")}

    <div style="background:#d1fae5;border-left:4px solid #059669;border-radius:4px;padding:16px 20px;margin:24px 0;">
      <h2 style="margin:0 0 8px;font-size:16px;font-weight:700;color:#065f46;">
        Stage 4: Close of Escrow 🎉
      </h2>
      <p style="margin:0;color:#064e3b;font-size:13px;line-height:1.6;">
        It is time to <strong>celebrate</strong>! We will meet to review and sign your
        closing documents${params.closingDate ? ` on <strong>${params.closingDate}</strong>` : ""}.
        Once all documents are signed and funds are transferred, you will receive the keys
        to your new home!
      </p>
    </div>

    <p style="margin:0 0 8px;color:#374151;font-size:14px;"><strong>What to expect at closing:</strong></p>
    <ul style="margin:0 0 24px;padding-left:20px;color:#6b7280;font-size:13px;line-height:1.8;">
      <li>Review and sign all closing documents</li>
      <li>Final walkthrough of the property</li>
      <li>Transfer of funds and closing costs</li>
      <li>Receive the keys to <strong>${params.propertyAddress}</strong>! 🔑</li>
    </ul>

    <p style="margin:0 0 24px;color:#374151;font-size:14px;">
      It has been an absolute pleasure working with you! Wishing you many wonderful
      years in your new home. Welcome home!
    </p>

    <div style="background:#f9fafb;border-radius:12px;padding:16px 20px;margin:24px 0;">
      <p style="margin:0;color:#6b7280;font-size:13px;"><strong>Your Agent:</strong> ${params.agentName}</p>
      ${params.agentPhone ? `<p style="margin:4px 0 0;color:#6b7280;font-size:13px;">📞 ${params.agentPhone}</p>` : ""}
      ${params.agentEmail ? `<p style="margin:4px 0 0;color:#6b7280;font-size:13px;">✉️ ${params.agentEmail}</p>` : ""}
    </div>

    <p style="margin:0;color:#059669;font-size:14px;font-weight:700;text-align:center;">
      🏡 Welcome Home! 🏡
    </p>
  `);
  return { subject, html };
}
