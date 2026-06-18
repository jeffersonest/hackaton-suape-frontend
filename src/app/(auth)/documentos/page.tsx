import { FolderOpen } from "@phosphor-icons/react/dist/ssr";
import { PagePlaceholder } from "@/components/layout";

export default function DocumentosPage() {
  return (
    <PagePlaceholder
      title="Documentos"
      description="Acesse e organize os documentos relacionados aos processos portuários."
      icon={FolderOpen}
    />
  );
}
