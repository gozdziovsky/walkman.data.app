import { ArchiveEngine } from "../components/archive/ArchiveEngine";
import { VinylAddModal } from "../components/modals/vinyl/VinylAddModal";
import { VinylDetailsModal } from "../components/modals/vinyl/VinylDetailsModal";
import logo from "../assets/grooveshelf_logo.png";

export default function VinylArchive() {
  return (
    <ArchiveEngine 
      tableName="albums_vinyl"
      archiveTitle="Vinyl Collection"
      themeColor="#f97316" // Pomarańczowy dla winyli
      logo={logo}
      formats={['12" LP', '10" EP', '7" Single']}
      AddModal={VinylAddModal}
      DetailsModal={VinylDetailsModal}
    />
  );
}