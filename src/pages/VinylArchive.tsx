import { ArchiveEngine } from '../components/archive/ArchiveEngine';
import { VinylAddModal } from '../components/modals/vinyl/VinylAddModal';
import { VinylDetailsModal } from '../components/modals/vinyl/VinylDetailsModal';

// Bezpieczny import obrazka w Vite z Twojego folderu assets
import logo from '../assets/grooveshelf_logo.png';

export const VinylArchive = () => {
  return (
    <ArchiveEngine
      tableName="vinyls"
      archiveTitle="Physical Collection"
      themeColor="#f97316" 
      logo={logo} 
      formats={['12" LP', '2xLP', '7" EP', '10" EP', 'Box Set']}
      AddModal={VinylAddModal}
      DetailsModal={VinylDetailsModal}
    />
  );
};