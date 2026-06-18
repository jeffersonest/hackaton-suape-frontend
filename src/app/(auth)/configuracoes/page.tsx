import { Gear } from "@phosphor-icons/react/dist/ssr";
import { PagePlaceholder } from "@/components/layout";

export default function ConfiguracoesPage() {
  return (
    <PagePlaceholder
      title="Configurações"
      description="Gerencie suas preferências e ajustes da plataforma."
      icon={Gear}
    />
  );
}
