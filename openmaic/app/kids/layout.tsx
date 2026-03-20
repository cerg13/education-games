import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Умная Классная — Интерактивное обучение для детей',
  description: 'AI-учитель, адаптивные уроки, квизы и интерактивные симуляции для детей от 5 лет',
};

export default function KidsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
}
