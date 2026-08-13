import { NextResponse } from "next/server";
import { getSupabaseAdminClient, getSupabaseServerClient } from "@/lib/supabaseServer";
import { sendOrderNotification, sendCustomerConfirmation } from "@/lib/email";

function generateOrderNumber() {
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `ALN-${Date.now().toString().slice(-6)}${rand}`;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      items,
      couponCode,
      paymentMethod,
    } = body;

    if (!customerName || !customerEmail || !customerPhone || !shippingAddress || !items?.length) {
      return NextResponse.json({ error: "Missing required checkout fields." }, { status: 400 });
    }

    const admin = getSupabaseAdminClient();

    // Re-price every line item server-side from the DB — never trust client-supplied prices.
    const productIds = items.map((i) => i.productId);
    const { data: products, error: productsError } = await admin
      .from("products")
      .select("id, title, price, stock")
      .in("id", productIds);

    if (productsError) throw productsError;

    const priced = items.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) throw new Error(`Product ${item.productId} not found`);
      if (product.stock < item.qty) {
        throw new Error(`"${product.title}" only has ${product.stock} left in stock.`);
      }
      return {
        product_id: product.id,
        title: product.title,
        price: Number(product.price),
        qty: item.qty,
        variant: item.variant || null,
      };
    });

    const subtotal = priced.reduce((sum, i) => sum + i.price * i.qty, 0);

    // Validate coupon
    let discount = 0;
    let appliedCoupon = null;
    if (couponCode) {
      const { data: coupon } = await admin
        .from("coupons")
        .select("*")
        .eq("code", couponCode.trim().toUpperCase())
        .eq("is_active", true)
        .single();

      if (coupon) {
        const notExpired = !coupon.expires_at || new Date(coupon.expires_at) > new Date();
        const underMaxUses = !coupon.max_uses || coupon.used_count < coupon.max_uses;
        const meetsMin = subtotal >= (coupon.min_order_amount || 0);

        if (notExpired && underMaxUses && meetsMin) {
          discount =
            coupon.discount_type === "percentage"
              ? (subtotal * coupon.discount_value) / 100
              : coupon.discount_value;
          discount = Math.min(discount, subtotal);
          appliedCoupon = coupon;
        }
      }
    }

    const shippingFee = subtotal - discount >= 999 ? 0 : 79;
    const total = Math.max(0, subtotal - discount + shippingFee);
    const orderNumber = generateOrderNumber();

    // Attach the logged-in user, if any
    const userClient = getSupabaseServerClient();
    const {
      data: { user },
    } = await userClient.auth.getUser();

    const { data: order, error: orderError } = await admin
      .from("orders")
      .insert({
        order_number: orderNumber,
        user_id: user?.id || null,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        shipping_address: shippingAddress,
        items: priced,
        subtotal,
        discount,
        coupon_code: appliedCoupon?.code || null,
        shipping_fee: shippingFee,
        total,
        payment_method: paymentMethod || "cod",
        payment_status: "pending",
        status: "pending",
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Decrement stock
    for (const item of priced) {
      const product = products.find((p) => p.id === item.product_id);
      await admin
        .from("products")
        .update({ stock: product.stock - item.qty })
        .eq("id", item.product_id);
    }

    // Increment coupon usage
    if (appliedCoupon) {
      await admin
        .from("coupons")
        .update({ used_count: appliedCoupon.used_count + 1 })
        .eq("id", appliedCoupon.id);
    }

    // Fire off notification emails — failures here shouldn't fail the order
    const { data: settings } = await admin.from("app_settings").select("*").eq("id", 1).single();
    try {
      await sendOrderNotification(order, settings?.admin_notification_email);
      await sendCustomerConfirmation(order);
    } catch (emailErr) {
      console.error("Order email failed:", emailErr);
    }

    return NextResponse.json({ order });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json({ error: err.message || "Checkout failed." }, { status: 500 });
  }
}
