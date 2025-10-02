import { supabase, QRISPayment } from './supabase';

export async function generateQRISPayment(
  userId: string,
  amount: number,
  type: 'deposit' | 'purchase',
  referenceId?: string
): Promise<QRISPayment> {
  const qrisCode = `QRIS${Date.now()}${Math.random().toString(36).substring(7).toUpperCase()}`;

  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 15);

  const { data, error } = await supabase
    .from('qris_payments')
    .insert({
      user_id: userId,
      qris_code: qrisCode,
      qris_url: `https://qris.id/pay/${qrisCode}`,
      amount,
      type,
      reference_id: referenceId || null,
      status: 'pending',
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function checkQRISPaymentStatus(qrisPaymentId: string): Promise<string> {
  const { data, error } = await supabase
    .from('qris_payments')
    .select('status')
    .eq('id', qrisPaymentId)
    .single();

  if (error) throw error;

  return data.status;
}

export async function completeQRISPayment(qrisPaymentId: string): Promise<void> {
  const { error } = await supabase
    .from('qris_payments')
    .update({ status: 'completed' })
    .eq('id', qrisPaymentId);

  if (error) throw error;
}

export async function simulateQRISPayment(qrisPaymentId: string): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(async () => {
      await completeQRISPayment(qrisPaymentId);
      resolve();
    }, 3000);
  });
}
