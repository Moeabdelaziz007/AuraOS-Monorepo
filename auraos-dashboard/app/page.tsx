import { DesktopOS } from "@/components/desktop/DesktopOS"
import { Dashboard } from '@/components/dashboard';
import { CallAIExample } from './call-ai-example';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <DesktopOS />
      <Dashboard />
      <CallAIExample />
    </main>
  );
}
