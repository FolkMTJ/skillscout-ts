import Image from "next/image";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="w-full bg-[#f6e8c8] dark:bg-gray-800 py-16 md:py-24">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          
          {/* ## Left Column: Text Content ## */}
          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-bold text-[#b4842d] dark:text-amber-300 leading-tight">
              ค้นหาเส้นทางไอทีที่ใช่ในตัวคุณ
            </h1>
            <p className="mt-2 text-2xl font-semibold text-[#c89b4a] dark:text-amber-400">
              แบบทดสอบความถนัดในอาชีพสายไอที
            </p>
            <p className="mt-6 text-lg text-gray-700 dark:text-gray-300">
              คุณสงสัยไหมว่าอาชีพในวงการไอทีแบบไหนที่เหมาะกับคุณ?
            </p>
            <Link href="/quiz">
              <button className="mt-8 px-10 py-4 bg-white text-amber-600 font-bold text-lg rounded-full shadow-lg hover:bg-amber-50 hover:scale-105 transform transition-all duration-300 ease-in-out">
                ทำแบบทดสอบ
              </button>
            </Link>
          </div>

          {/* ## Right Column: Logo and Graphic ## */}
          <div className="flex flex-col items-center justify-center">
            {/* You can replace this Image with your actual logo component or SVG */}
            <div className="relative w-full max-w-md">
              <Image
                src="/skillscoutLogo.png" // Path to your logo in the 'public' folder
                alt="Skill Scout Graphic"
                width={500}
                height={300}
                style={{ objectFit: 'contain' }}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center -mt-4">
                <h2 className="text-5xl md:text-6xl font-extrabold tracking-wider text-amber-500">
                  SKILL SCOUT
                </h2>
                <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
                  ก้าวแรกสู่ความสำเร็จในแบบของคุณ
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}