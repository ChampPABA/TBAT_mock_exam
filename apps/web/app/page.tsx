import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="from-primary-50 to-primary-100 flex min-h-screen items-center justify-center bg-gradient-to-br p-8">
      <main className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-lg">
        <h1 className="text-primary font-prompt mb-4 text-3xl font-bold">TBAT Mock Exam</h1>
        <p className="mb-6 text-gray-600">ระบบสอบจำลอง TBAT สำหรับนักเรียนเชียงใหม่</p>
        <div className="space-y-4">
          <Button className="w-full">เริ่มทำแบบทดสอบ</Button>
          <Button variant="outline" className="w-full">
            ดูผลสอบ
          </Button>
          <Button variant="ghost" className="w-full">
            เกี่ยวกับเรา
          </Button>
        </div>
      </main>
    </div>
  );
}
