import { Layout } from "./Layout";
import { PageCard } from "./PageCard";

interface ComingSoonPageProps {
  pageTitle: string;
  heading?: string;
  message: string;
}

export function ComingSoonPage({ pageTitle, heading, message }: ComingSoonPageProps) {
  return (
    <Layout pageTitle={pageTitle}>
      <PageCard>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">{heading ?? pageTitle}</h2>
        <p className="text-gray-500">{message}</p>
      </PageCard>
    </Layout>
  );
}
