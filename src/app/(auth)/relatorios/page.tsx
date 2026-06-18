import { ChartBar } from "@phosphor-icons/react/dist/ssr";
import { PagePlaceholder } from "@/components/layout";

export default function RelatoriosPage() {
  return (
    <PagePlaceholder
      title="Relatórios"
      description="Visualize indicadores e relatórios das operações do Porto de Suape."
      icon={ChartBar}
    />
  );
}
