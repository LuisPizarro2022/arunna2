import Link from 'next/link';

export default function Home() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">PixelMouse</h1>
      <p>Local-only CRM + templates + assisted campaigns for WhatsApp Web.</p>
      <Link href="/accounts" className="text-blue-600 underline">Start by creating an account</Link>
    </div>
  );
}
