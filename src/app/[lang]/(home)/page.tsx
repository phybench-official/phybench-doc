import Hero from "@/components/ui/neural-network-hero";

export default function HomePage() {
  return (
    <main className="w-screen h-screen flex flex-col relative flex-1">
      <Hero
        title="PHYBench Documentation"
        description="PHYBench: Holistic Evaluation of Physical Perception and Reasoning in Large Language Models"
        badgeText="现已提供在线评测接口"
        badgeLabel="New"
        ctaButtons={[
          { text: "提交评测", href: "/submit", primary: true },
          { text: "回主站", href: "https://www.phybench.cn" }
        ]}
        microDetails={["Peking University", "NIPS 2025", "Under Construction..."]}
      />
    </main>
  );
}
