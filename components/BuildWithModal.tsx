'use client';

interface BuildWithModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BuildWithModal({ isOpen, onClose }: BuildWithModalProps) {
  if (!isOpen) return null;

  const techStack = [
    {
      name: 'Next.js',
      description: 'React framework',
      url: 'https://nextjs.org/',
    },
    {
      name: 'TypeScript',
      description: 'Type safety',
      url: 'https://www.typescriptlang.org/',
    },
    {
      name: 'Tailwind CSS',
      description: 'Styling',
      url: 'https://tailwindcss.com/',
    },
  ];

  return (
    <div 
      className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-background p-6 rounded-lg shadow-xl max-w-sm w-full mx-4 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-foreground hover:text-muted-foreground text-xl font-bold"
          aria-label="Close modal"
        >
          ×
        </button>

        <h3 className="text-xl font-semibold mb-4">Built With</h3>
        
        <div className="space-y-3 mt-4">
          {techStack.map((tech, index) => (
            <div key={index}>
              <a
                href={tech.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground hover:underline font-semibold"
              >
                {tech.name}
              </a>
              <span className="text-muted-foreground"> - {tech.description}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
