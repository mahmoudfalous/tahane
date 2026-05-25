import { getTemplates } from '@/data/templates';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return Response.json(getTemplates());
  } catch {
    return Response.json({ error: 'مجلد التصاميم غير موجود' }, { status: 404 });
  }
}
