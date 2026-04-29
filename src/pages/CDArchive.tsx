import { ArchiveEngine } from "../components/archive/ArchiveEngine";
import { CDAddModal } from "../components/modals/cd/CDAddModal";
import { CDDetailsModal } from "../components/modals/cd/CDDetailsModal";
import logo from "../assets/grooveshelf_logo.png";

export default function CDArchive() {
  return (
    <ArchiveEngine 
      tableName="albums_cd"
      archiveTitle="CD Collection"
      themeColor="#3b82f6" // Niebieski dla CD
      logo={logo}
      formats={['CD', 'Gold CD', 'SACD', 'Box Set']}
      AddModal={CDAddModal}
      DetailsModal={CDDetailsModal}
    />
  );
}