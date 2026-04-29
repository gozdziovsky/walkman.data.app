import { ArchiveEngine } from "../components/archive/ArchiveEngine";
import { DigitalAddModal } from "../components/modals/digital/DigitalAddModal";
import { DigitalDetailsModal } from "../components/modals/digital/DigitalDetailsModal";
import logo from "../assets/grooveshelf_logo.png";

export default function DigitalArchive() {
  return (
    <ArchiveEngine 
      tableName="albums" // Tabela bazowa
      archiveTitle="Digital Library"
      themeColor="#22c55e" // Zielony dla Digital
      logo={logo}
      formats={['FLAC', 'MP3', 'Hi-Res', 'WAV']}
      AddModal={DigitalAddModal}
      DetailsModal={DigitalDetailsModal}
    />
  );
}