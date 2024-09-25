import { BallotTabs } from '@/components/ballot/ballot-tabs';

export default function BallotLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <div className="flex-1 space-y-6">
        <BallotTabs />

        {children}
      </div>
      {/* <aside>
        <BallotSidebar />
      </aside> */}
    </>
  );
}
