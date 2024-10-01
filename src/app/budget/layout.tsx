import { PostSubmissionBanner } from '@/components/ballot/post-submission-banner';

export default function BallotLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <div className="flex-1 space-y-6">
        <PostSubmissionBanner />
        {children}
      </div>
    </>
  );
}
