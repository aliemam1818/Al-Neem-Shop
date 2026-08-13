import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function formatCurrency(n) {
  return `₹${Number(n).toFixed(2)}`;
}

function orderEmailHtml(order) {
  const itemRows = order.items
    .map(
      (i) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #eee;">
          ${i.title}${i.variant ? ` <span style="color:#8A9678;">(${i.variant})</span>` : ""}
        </td>
        <td style="padding:10px 0;border-bottom:1px solid #eee;text-align:center;">${i.qty}</td>
        <td style="padding:10px 0;border-bottom:1px solid #eee;text-align:right;">${formatCurrency(
          i.price * i.qty
        )}</td>
      </tr>`
    )
    .join("");

  const addr = order.shipping_address;

  return `
  <div style="font-family:Georgia,serif;background:#FAF6ED;padding:32px;color:#211F1A;">
    <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #E4C989;">
      <div style="background:#2F3B26;padding:24px 32px;">
        <span style="color:#E4C989;font-size:22px;letter-spacing:2px;">ALNEEM</span>
        <div style="color:#fff;font-size:14px;margin-top:4px;">New order received</div>
      </div>
      <div style="padding:24px 32px;">
        <table style="width:100%;font-size:14px;margin-bottom:20px;">
          <tr><td style="color:#8A9678;">Order ID</td><td style="text-align:right;font-weight:bold;">${order.order_number}</td></tr>
          <tr><td style="color:#8A9678;">Placed</td><td style="text-align:right;">${new Date(
            order.created_at
          ).toLocaleString("en-IN")}</td></tr>
          <tr><td style="color:#8A9678;">Payment</td><td style="text-align:right;">${order.payment_method.toUpperCase()}</td></tr>
        </table>

        <h3 style="color:#2F3B26;border-bottom:2px solid #C6A15B;padding-bottom:6px;">Customer</h3>
        <p style="font-size:14px;line-height:1.6;">
          ${order.customer_name}<br/>
          ${order.customer_email}<br/>
          ${order.customer_phone}
        </p>

        <h3 style="color:#2F3B26;border-bottom:2px solid #C6A15B;padding-bottom:6px;">Shipping address</h3>
        <p style="font-size:14px;line-height:1.6;">
          ${addr.line1}${addr.line2 ? `, ${addr.line2}` : ""}<br/>
          ${addr.city}, ${addr.state} ${addr.postal_code}<br/>
          ${addr.country}
        </p>

        <h3 style="color:#2F3B26;border-bottom:2px solid #C6A15B;padding-bottom:6px;">Items</h3>
        <table style="width:100%;font-size:14px;border-collapse:collapse;">
          <thead>
            <tr style="color:#8A9678;text-align:left;">
              <th style="padding-bottom:6px;">Item</th>
              <th style="padding-bottom:6px;text-align:center;">Qty</th>
              <th style="padding-bottom:6px;text-align:right;">Amount</th>
            </tr>
          </thead>
          <tbody>${itemRows}</tbody>
        </table>

        <table style="width:100%;font-size:14px;margin-top:12px;">
          <tr><td style="color:#8A9678;">Subtotal</td><td style="text-align:right;">${formatCurrency(order.subtotal)}</td></tr>
          ${
            order.discount > 0
              ? `<tr><td style="color:#8A9678;">Discount ${order.coupon_code ? `(${order.coupon_code})` : ""}</td><td style="text-align:right;">-${formatCurrency(order.discount)}</td></tr>`
              : ""
          }
          <tr><td style="color:#8A9678;">Shipping</td><td style="text-align:right;">${formatCurrency(order.shipping_fee)}</td></tr>
          <tr style="font-size:17px;font-weight:bold;color:#2F3B26;">
            <td style="padding-top:8px;">Total</td>
            <td style="text-align:right;padding-top:8px;">${formatCurrency(order.total)}</td>
          </tr>
        </table>
      </div>
      <div style="background:#F3ECDC;padding:16px 32px;font-size:12px;color:#8A9678;text-align:center;">
        Sent automatically by the ALNEEM store order system.
      </div>
    </div>
  </div>`;
}

/**
 * Notifies the store admin that a new order has come in.
 * adminEmail is read from app_settings so it's editable live from the dashboard.
 */
export async function sendOrderNotification(order, adminEmail) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not set — skipping admin email notification.");
    return { skipped: true };
  }
  return resend.emails.send({
    from: process.env.EMAIL_FROM || "ALNEEM Store <orders@alneem.store>",
    to: adminEmail || process.env.ADMIN_NOTIFICATION_EMAIL || "alneemcare@gmail.com",
    subject: `New order ${order.order_number} — ${formatCurrency(order.total)}`,
    html: orderEmailHtml(order),
  });
}

/** Simple confirmation email sent back to the customer. */
export async function sendCustomerConfirmation(order) {
  if (!process.env.RESEND_API_KEY) return { skipped: true };
  return resend.emails.send({
    from: process.env.EMAIL_FROM || "ALNEEM Store <orders@alneem.store>",
    to: order.customer_email,
    subject: `Your ALNEEM order ${order.order_number} is confirmed`,
    html: `
      <div style="font-family:Georgia,serif;background:#FAF6ED;padding:32px;color:#211F1A;">
        <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:12px;padding:32px;border:1px solid #E4C989;">
          <span style="color:#9C7A3C;font-size:20px;letter-spacing:2px;">ALNEEM</span>
          <h2 style="color:#2F3B26;">Thank you, ${order.customer_name.split(" ")[0]}.</h2>
          <p style="font-size:14px;line-height:1.6;">
            Your order <strong>${order.order_number}</strong> has been received and is being prepared.
            We'll email you again once it ships.
          </p>
          <p style="font-size:14px;color:#8A9678;">Order total: ${formatCurrency(order.total)}</p>
        </div>
      </div>`,
  });
}
