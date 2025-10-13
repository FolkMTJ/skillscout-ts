import React from "react";
import Image from "next/image"; // Import Next.js Image component

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  category?: string;
}

export default function PageHeader({ 
  title, 
  subtitle,
  category,
}: PageHeaderProps) {

  const theme = {
    accent: '#F2B33D',
    darkBg: '#2C2C2C',
    white: '#FFFFFF',
  };

  const getAnimation = (delay: string) => ({
    animation: `fadeInUp 0.8s ease-out ${delay} forwards`,
    opacity: 0,
  });

  return (
    <section 
      className="relative overflow-hidden border-b"
      style={{ backgroundColor: theme.darkBg, borderColor: theme.accent + '20' }}
    >
      {/* ## 1. New Unsplash Background Image ## */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1489648022186-8f49310909a0?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=910" // Tech-themed image from Unsplash
          alt="Abstract code background"
          fill
          style={{ objectFit: 'cover' }}
          priority // Load the background image quickly
        />
        {/* ## 2. Dark Overlay for Readability ## */}
        <div className="absolute inset-0 bg-gray-900/80" /> 
      </div>

      <div className="relative z-10 container mx-auto px-6 py-24 md:py-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          
          {/* ## Left Column (Content) ## */}
          <div className="flex flex-col items-start">
            {category && (
              <div 
                style={{
                  ...getAnimation('0s'),
                  borderColor: theme.accent + '40',
                  backgroundColor: theme.accent + '10',
                  color: theme.accent,
                }}
                className="mb-4 inline-block px-4 py-1.5 text-sm font-semibold rounded-full border"
              >
                {category}
              </div>
            )}

            <h1 
              style={{
                ...getAnimation('0.2s'),
                backgroundImage: `linear-gradient(to right, ${theme.accent}, #FFD700)`,
              }}
              className="text-5xl md:text-7xl font-black bg-clip-text text-transparent leading-tight drop-shadow-lg"
            >
              {title}
            </h1>

            {subtitle && (
              <p 
                style={{
                  ...getAnimation('0.4s'), 
                  color: '#c7c7c7'
                }}
                className="mt-6 text-xl md:text-2xl leading-relaxed max-w-2xl"
              >
                {subtitle}
              </p>
            )}
          </div>

          {/* ## Right Column (Code Snippet) ## */}
          <div className="hidden md:block border rounded-lg p-6 backdrop-blur-sm"
            style={{ backgroundColor: theme.darkBg + '80', borderColor: theme.white + '1A' }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <pre className="text-sm font-mono overflow-hidden" style={{color: theme.white}}>
              <code>
                <span style={{color: '#9ca3af'}}>\\ Find your path with SkillScout...</span><br />
                <span style={{color: '#c778dd'}}>const</span> <span style={{color: theme.accent}}>findCareer</span> = (<span style={{color: '#61afef'}}>user</span>) =&gt; {'{'}<br />
                {'  '}<span style={{color: '#9ca3af'}}>\\ Match skills to the perfect role.</span><br />
                {'  '}<span style={{color: '#c778dd'}}>const</span> {'{'} <span style={{color: '#d19a66'}}>skills</span>, <span style={{color: '#d19a66'}}>goals</span> {'}'} = <span style={{color: '#61afef'}}>user</span>;<br />
                {'  '}<span style={{color: '#e06c75'}}>if</span> (skills &amp;&amp; goals) {'{'}<br />
                {'    '}<span style={{color: '#c778dd'}}>return</span> <span style={{color: '#98c379'}}>`Your future is bright!`</span>;<br />
                {'  '}{'}'}<br />
                {'}'};
              </code>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}