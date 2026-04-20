import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import TestDataGenerator from './TestDataGenerator';
import Inventory_API from '../../API/Inventory_API';
import Item_API from '../../API/Item_API';
import Record_API from '../../API/Record_API';
import { INVENTORY_CONSTANTS } from '../../Constants/Constants';
import {
  generateMetadataForRecord,
  metadataSummary, metadataTotal,
} from '../testDataUtils';

const QuickActions = ({ projectData }) => {
  const queryClient = useQueryClient();
  const [logs, setLogs] = useState([]);
  const [showGenerator, setShowGenerator] = useState(false);
  const [isDeletingInventories, setIsDeletingInventories] = useState(false);
  const [isDeletingItems, setIsDeletingItems] = useState(false);
  const [isPopulatingReports, setIsPopulatingReports] = useState(false);

  const inventoryAPI = Inventory_API();
  const itemAPI = Item_API();
  const recordAPI = Record_API();

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { message, type, timestamp }]);
  };

  const clearLogs = () => setLogs([]);

  // Bulk delete all inventories
  const bulkDeleteInventories = async () => {
    if (!projectData?.id || !projectData?.institution?.fond?.inventories) {
      addLog('Nav aktīvs projekts vai nav uzskaites sarakstu', 'error');
      return;
    }

    const inventories = projectData.institution.fond.inventories;
    // Filter out inventories from reports (they cannot be deleted)
    const deletableInventories = inventories.filter(inv => !inv.from_report);
    const reportInventories = inventories.filter(inv => inv.from_report);

    if (deletableInventories.length === 0) {
      addLog('Nav dzēšamu uzskaites sarakstu (visi ir no atskaites)', 'warning');
      return;
    }

    let confirmMessage = `Vai tiešām vēlaties dzēst ${deletableInventories.length} uzskaites sarakstus?\n\n` +
      `Šī darbība dzēsīs arī visas saistītās:\n` +
      `- Glabājamās vienības\n` +
      `- Ierakstus\n` +
      `- Failus\n\n`;

    if (reportInventories.length > 0) {
      confirmMessage += `Piezīme: ${reportInventories.length} uzskaites saraksti no atskaites netiks dzēsti.\n\n`;
    }

    confirmMessage += `ŠĪ DARBĪBA IR NEATGRIEZENISKA!`;

    const confirmed = window.confirm(confirmMessage);

    if (!confirmed) {
      addLog('Dzēšana atcelta', 'info');
      return;
    }

    setIsDeletingInventories(true);
    addLog(`Sāk dzēst ${deletableInventories.length} uzskaites sarakstus...`, 'info');

    let deletedCount = 0;
    let failedCount = 0;

    for (let i = 0; i < deletableInventories.length; i++) {
      const inventory = deletableInventories[i];
      try {
        const [success, result] = await inventoryAPI.deleteInventory(projectData.id, inventory.id);

        if (success) {
          deletedCount++;
          addLog(`✓ Dzēsts US #${inventory.number} (${deletedCount}/${deletableInventories.length})`, 'success');
        } else {
          failedCount++;
          addLog(`✗ Kļūda dzēšot US #${inventory.number}: ${result}`, 'error');
        }
      } catch (error) {
        failedCount++;
        addLog(`✗ Kļūda dzēšot US #${inventory.number}: ${error.message}`, 'error');
      }
    }

    // Invalidate queries to refresh the UI
    queryClient.invalidateQueries({ queryKey: ['projects'] });
    queryClient.invalidateQueries({ queryKey: ['project', projectData.id] });

    setIsDeletingInventories(false);
    addLog('════════════════════════════════════', 'info');
    addLog(`Pabeigts! Dzēsti: ${deletedCount}, Kļūdas: ${failedCount}`, deletedCount > 0 ? 'success' : 'error');
    if (reportInventories.length > 0) {
      addLog(`Piezīme: ${reportInventories.length} uzskaites saraksti no atskaites netika dzēsti`, 'info');
    }
  };

  // Bulk delete all items from all inventories
  const bulkDeleteItems = async () => {
    if (!projectData?.id || !projectData?.institution?.fond?.inventories) {
      addLog('Nav aktīvs projekts vai nav uzskaites sarakstu', 'error');
      return;
    }

    // Collect all items from all inventories
    const allItems = [];
    for (const inventory of projectData.institution.fond.inventories) {
      if (inventory.items && inventory.items.length > 0) {
        for (const item of inventory.items) {
          allItems.push({ ...item, inventoryNumber: inventory.number });
        }
      }
    }

    if (allItems.length === 0) {
      addLog('Nav glabājamo vienību ko dzēst', 'warning');
      return;
    }

    const confirmed = window.confirm(
      `Vai tiešām vēlaties dzēst VISAS ${allItems.length} glabājamās vienības?\n\n` +
      `Šī darbība dzēsīs arī visus saistītos:\n` +
      `- Ierakstus\n` +
      `- Failus\n\n` +
      `ŠĪ DARBĪBA IR NEATGRIEZENISKA!`
    );

    if (!confirmed) {
      addLog('Dzēšana atcelta', 'info');
      return;
    }

    setIsDeletingItems(true);
    addLog(`Sāk dzēst ${allItems.length} glabājamās vienības...`, 'info');

    let deletedCount = 0;
    let failedCount = 0;

    for (let i = 0; i < allItems.length; i++) {
      const item = allItems[i];
      try {
        const [success, result] = await itemAPI.deleteItem(projectData.id, item.id);

        if (success) {
          deletedCount++;
          addLog(`✓ Dzēsta GV #${item.number} no US #${item.inventoryNumber} (${deletedCount}/${allItems.length})`, 'success');
        } else {
          failedCount++;
          addLog(`✗ Kļūda dzēšot GV #${item.number}: ${result}`, 'error');
        }
      } catch (error) {
        failedCount++;
        addLog(`✗ Kļūda dzēšot GV #${item.number}: ${error.message}`, 'error');
      }
    }

    // Invalidate queries to refresh the UI
    queryClient.invalidateQueries({ queryKey: ['projects'] });
    queryClient.invalidateQueries({ queryKey: ['project', projectData.id] });

    setIsDeletingItems(false);
    addLog('════════════════════════════════════', 'info');
    addLog(`Pabeigts! Dzēsti: ${deletedCount}, Kļūdas: ${failedCount}`, deletedCount > 0 ? 'success' : 'error');
  };

  // Populate report inventories with test data
  const populateReportInventories = async () => {
    if (!projectData?.id || !projectData?.institution?.fond?.inventories) {
      addLog('Nav aktīvs projekts vai nav uzskaites sarakstu', 'error');
      return;
    }

    const reportInventories = projectData.institution.fond.inventories.filter(inv => inv.from_report);

    if (reportInventories.length === 0) {
      addLog('Nav atskaites uzskaites sarakstu ko populēt', 'warning');
      return;
    }

    // Check which inventories have valid dates
    let inventoriesWithoutDates = reportInventories.filter(inv => !inv.start_date || !inv.end_date);

    let confirmMessage = `Vai vēlaties populēt ${reportInventories.length} atskaites uzskaites sarakstus ar testa datiem?\n\n` +
      `Tiks izveidoti:\n` +
      `- ~100 glabājamās vienības\n` +
      `- Ieraksti katrai vienībai\n` +
      `- Testa faili katram ierakstam (foto/video/audio/teksta faili)\n` +
      `- Metadati: vīzas, adresāti, uzdevumi, iepazīšanās statusi\n\n`;

    if (inventoriesWithoutDates.length > 0) {
      confirmMessage += `Piezīme: ${inventoriesWithoutDates.length} uzskaites sarakstiem tiks automātiski pievienoti datumi.\n\n`;
    }

    confirmMessage += `Šie dati ir tikai testēšanai!`;

    const confirmed = window.confirm(confirmMessage);

    if (!confirmed) {
      addLog('Populēšana atcelta', 'info');
      return;
    }

    setIsPopulatingReports(true);
    addLog('Sāk populēt atskaites uzskaites sarakstus...', 'info');

    // Step 1: Update inventories without dates
    if (inventoriesWithoutDates.length > 0) {
      addLog(`Atjaunina ${inventoriesWithoutDates.length} uzskaites sarakstus ar datumiem...`, 'info');

      const currentYear = new Date().getFullYear();
      let updatedCount = 0;
      let failedUpdates = 0;

      for (const inventory of inventoriesWithoutDates) {
        // Generate random dates for the current year
        const randomMonth = Math.floor(Math.random() * 12);
        const startDate = new Date(currentYear, randomMonth, 1);
        const endDate = new Date(currentYear, randomMonth + 1, 0); // Last day of the month

        const updateData = {
          number: inventory.number,
          type: inventory.type,
          storage_term: inventory.storage_term,
          electronic: inventory.electronic,
          subfond: inventory.subfond,
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0]
        };

        try {
          const [success, result] = await inventoryAPI.updateInventory(projectData.id, inventory.id, updateData);
          if (success) {
            updatedCount++;
            addLog(`✓ Atjaunināts US #${inventory.number} ar datumiem: ${updateData.start_date} - ${updateData.end_date}`, 'success');
            // Update the local reference
            inventory.start_date = updateData.start_date;
            inventory.end_date = updateData.end_date;
          } else {
            failedUpdates++;
            addLog(`✗ Kļūda atjauninot US #${inventory.number}: ${result}`, 'error');
          }
        } catch (error) {
          failedUpdates++;
          addLog(`✗ Kļūda atjauninot US #${inventory.number}: ${error.message}`, 'error');
        }
      }

      addLog(`Datumu atjaunināšana pabeigta: ${updatedCount} veiksmīgi, ${failedUpdates} kļūdas`, updatedCount > 0 ? 'success' : 'error');

      if (failedUpdates > 0 && updatedCount === 0) {
        addLog('Nav iespējams turpināt - neizdevās atjaunināt nevienu uzskaites sarakstu', 'error');
        setIsPopulatingReports(false);
        return;
      }
    }

    // Helper functions
    const randomDate = (start, end) => {
      const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
      return date.toISOString().split('T')[0];
    };

    const generateSeriesCode = () => {
      const part1 = Math.floor(Math.random() * 20) + 1;
      const part2 = Math.floor(Math.random() * 99) + 1;
      const useThirdPart = Math.random() > 0.5;
      if (useThirdPart) {
        const part3 = Math.floor(Math.random() * 99) + 1;
        return `${part1}.${part2}.${part3}`;
      }
      return `${part1}.${part2}`;
    };

    const randomName = (type) => {
      const names = {
        'Foto': ['Foto', 'Attēls', 'Fotogrāfija', 'Uzņēmums'],
        'Video': ['Video', 'Ieraksts', 'Filmējums', 'Klips'],
        'Skaņas': ['Audio', 'Ieraksts', 'Skaņa', 'Dziesma'],
        'Tekstuāls': ['Dokuments', 'Fails', 'Teksts', 'Materiāls']
      };
      const options = names[type] || ['Objekts'];
      return options[Math.floor(Math.random() * options.length)];
    };

    // Metadata generation uses the shared utility from testDataUtils.js

    // Load and categorize files from manifest by extension
    const loadFileManifest = async () => {
      try {
        const response = await fetch('/files/manifest.json');
        if (!response.ok) {
          throw new Error('Failed to load manifest');
        }
        const manifest = await response.json();

        // Auto-categorize files by extension
        const categorized = {
          'Foto': [],
          'Video': [],
          'Skaņas': [],
          'Tekstuāls': []
        };

        const extensionMapping = {
          // Image extensions
          '.jpg': 'Foto',
          '.jpeg': 'Foto',
          '.png': 'Foto',
          '.gif': 'Foto',
          '.bmp': 'Foto',
          '.tiff': 'Foto',
          // Video extensions
          '.mp4': 'Video',
          '.avi': 'Video',
          '.mov': 'Video',
          '.mkv': 'Video',
          '.wmv': 'Video',
          '.flv': 'Video',
          // Audio extensions
          '.mp3': 'Skaņas',
          '.wav': 'Skaņas',
          '.flac': 'Skaņas',
          '.aac': 'Skaņas',
          '.ogg': 'Skaņas',
          '.wma': 'Skaņas',
          // Document/Text extensions
          '.txt': 'Tekstuāls',
          '.doc': 'Tekstuāls',
          '.docx': 'Tekstuāls',
          '.pdf': 'Tekstuāls',
          '.xlsx': 'Tekstuāls',
          '.xls': 'Tekstuāls',
          '.edoc': 'Tekstuāls',
          '.rtf': 'Tekstuāls',
          '.odt': 'Tekstuāls'
        };

        manifest.files.forEach(fileName => {
          const extension = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
          const category = extensionMapping[extension];
          if (category && categorized[category]) {
            categorized[category].push(fileName);
          }
        });

        addLog(`Ielādēti ${manifest.files.length} testa faili: Foto(${categorized['Foto'].length}), Video(${categorized['Video'].length}), Audio(${categorized['Skaņas'].length}), Teksts(${categorized['Tekstuāls'].length})`, 'info');
        return categorized;
      } catch (error) {
        console.error('Error loading file manifest:', error);
        addLog('Kļūda ielādējot failu sarakstu, izmanto noklusējuma failus', 'warning');
        // Return empty arrays if manifest fails to load
        return {
          'Foto': [],
          'Video': [],
          'Skaņas': [],
          'Tekstuāls': []
        };
      }
    };

    // Fetch random test file from public folder for inventory type
    const getRandomTestFile = async (inventoryType, categorizedFiles) => {
      const filesForType = categorizedFiles[inventoryType] || categorizedFiles['Tekstuāls'];

      if (!filesForType || filesForType.length === 0) {
        addLog(`Nav pieejamu ${inventoryType} tipa failu`, 'warning');
        return null;
      }

      const randomFile = filesForType[Math.floor(Math.random() * filesForType.length)];
      const filePath = `/files/${randomFile}`;

      try {
        const response = await fetch(filePath);
        if (!response.ok) {
          throw new Error(`Failed to fetch file: ${response.status}`);
        }
        const blob = await response.blob();
        return new File([blob], randomFile, { type: blob.type || 'application/octet-stream' });
      } catch (error) {
        console.error(`Error loading test file ${randomFile}:`, error);
        return null;
      }
    };

    let totalItemsCreated = 0;
    let totalRecordsCreated = 0;
    let totalFilesUploaded = 0;
    let totalMetadataCreated = { visas: 0, addressees: 0, actions: 0, read_statuses: 0 };
    let totalMetadataFailed = 0;
    let failedItems = 0;
    let failedRecords = 0;
    let failedFiles = 0;

    try {
      // Step 2: Create items for each report inventory
      addLog('═══════════════════════════════════', 'info');
      addLog('Sāk veidot glabājamās vienības...', 'info');

      const processableInventories = reportInventories.filter(inv => inv.start_date && inv.end_date);

      if (processableInventories.length === 0) {
        addLog('Nav uzskaites sarakstu ar datumiem ko apstrādāt', 'error');
        setIsPopulatingReports(false);
        return;
      }

      for (const inventory of processableInventories) {
        const itemsPerInventory = Math.floor(100 / processableInventories.length) + Math.floor(Math.random() * 10);
        addLog(`Sāk populēt US #${inventory.number} (${inventory.type}) ar ${itemsPerInventory} vienībām...`, 'info');

        const isMediaType = INVENTORY_CONSTANTS.MEDIA_TYPES.includes(inventory.type);

        const currentItemCount = inventory.items?.length || 0;
        const invStartDate = new Date(inventory.start_date);
        const invEndDate = new Date(inventory.end_date);

        // Validate that dates are valid
        if (isNaN(invStartDate.getTime()) || isNaN(invEndDate.getTime())) {
          addLog(`✗ Kļūda: US #${inventory.number} datumi nav derīgi`, 'error');
          continue;
        }

        for (let i = 0; i < itemsPerInventory; i++) {
          const itemNumber = currentItemCount + i + 1;
          const itemStartDate = randomDate(invStartDate, invEndDate);
          const itemEndDate = randomDate(new Date(itemStartDate), invEndDate);

          const itemData = {
            title: `${randomName(inventory.type)} ${itemNumber}`,
            series_code: generateSeriesCode(),
            start_date: itemStartDate,
            end_date: itemEndDate,
            number: itemNumber,
            language: 'Latviešu',
            volume: Math.floor(Math.random() * 100) + 1,
            volume_unit: 'Lapas',
            notes: `Testa ${inventory.type} vienība nr. ${itemNumber}`,
            annotation: `${inventory.type} materiāla detalizēts apraksts nr. ${itemNumber}`
          };

          if (isMediaType) {
            itemData.annotation = `${inventory.type} materiāla detalizēts apraksts - vienība ${itemNumber}. Satur kvalitatīvu ${inventory.type.toLowerCase()} saturu testēšanas nolūkiem.`;
          }

          try {
            const [success, result] = await itemAPI.createItem(itemData, projectData.id, inventory.id);
            if (success) {
              totalItemsCreated++;
            } else {
              failedItems++;
              addLog(`✗ Kļūda veidojot GV #${itemNumber}: ${result}`, 'error');
            }
          } catch (error) {
            failedItems++;
            addLog(`✗ Kļūda veidojot GV #${itemNumber}: ${error.message}`, 'error');
          }
        }

        addLog(`✓ Pabeigta US #${inventory.number} populēšana`, 'success');
      }

      addLog(`Izveidotas ${totalItemsCreated} glabājamās vienības`, 'success');

      // Step 3: Fetch updated project data to get item IDs
      addLog('═══════════════════════════════════', 'info');
      addLog('Iegūst izveidoto vienību ID...', 'info');
      const projectResponse = await fetch(`/api/v1/project/${projectData.id}/`);
      const updatedProjectData = await projectResponse.json();

      const itemsWithIds = [];
      if (updatedProjectData?.institution?.fond?.inventories) {
        for (const inventory of updatedProjectData.institution.fond.inventories) {
          if (inventory.from_report && inventory.items && inventory.items.length > 0) {
            for (const item of inventory.items) {
              itemsWithIds.push({
                id: item.id,
                inventoryType: inventory.type,
                inventoryId: inventory.id,
                electronic: inventory.electronic,
                start_date: item.start_date,
                end_date: item.end_date,
                number: item.number
              });
            }
          }
        }
      }

      addLog(`Atrastas ${itemsWithIds.length} vienības ar ID`, 'info');

      // Filter to only electronic items - physical items don't have records
      const electronicItems = itemsWithIds.filter(item => item.electronic);
      const physicalItems = itemsWithIds.filter(item => !item.electronic);

      if (physicalItems.length > 0) {
        addLog(`Izlaistas ${physicalItems.length} fiziskas vienības (tām nav ieraksti)`, 'info');
      }

      if (electronicItems.length === 0) {
        addLog('Nav elektronisko vienību kurām izveidot ierakstus', 'warning');
        setIsPopulatingReports(false);
        return;
      }

      // Step 4: Create records with files for each electronic item only
      addLog('═══════════════════════════════════', 'info');
      addLog(`Sāk veidot ierakstus ar failiem ${electronicItems.length} elektroniskām vienībām...`, 'info');

      // Load file manifest and categorize by extension
      const categorizedFiles = await loadFileManifest();

      for (const item of electronicItems) {
        const isMediaType = INVENTORY_CONSTANTS.MEDIA_TYPES.includes(item.inventoryType);
        const recordsToCreate = isMediaType ? 1 : Math.floor(Math.random() * 3) + 1;

        for (let r = 0; r < recordsToCreate; r++) {
          const recordDate = randomDate(new Date(item.start_date), new Date(item.end_date));

          if (isMediaType) {
            // For media records: create record with file in one step
            try {
              const testFile = await getRandomTestFile(item.inventoryType, categorizedFiles);
              if (testFile) {
                const [success, result] = await recordAPI.createMediaRecord(projectData.id, item.id, testFile);
                if (success) {
                  totalRecordsCreated++;
                  totalFilesUploaded++;
                  addLog(`✓ Izveidots ${item.inventoryType} ieraksts ar failu GV #${item.number}`, 'success');
                } else {
                  failedRecords++;
                  addLog(`✗ Kļūda veidojot ${item.inventoryType} ierakstu: ${result}`, 'error');
                }
              } else {
                failedRecords++;
                failedFiles++;
                addLog(`✗ Neizdevās ielādēt testa failu ${item.inventoryType} tipam`, 'error');
              }
            } catch (error) {
              failedRecords++;
              addLog(`✗ Kļūda veidojot ${item.inventoryType} ierakstu: ${error.message}`, 'error');
            }
          } else {
            // For textual records: create record first, then upload files
            const recordData = {
              title: `Ieraksts ${r + 1} - GV #${item.number}`,
              date: recordDate,
              created_date: recordDate,
              sent_date: recordDate,
              language: 'Latviešu',
              reg_nr: `REG-${Math.floor(Math.random() * 10000)}`,
              nomenclature_nr: `NOM-${Math.floor(Math.random() * 1000)}`,
              notes: `Testa ieraksts nr. ${r + 1}`,
              annotation: `Detalizēts apraksts ierakstam ${r + 1}`,
              key_words: 'tests, dokumentācija, arhīvs',
              access_restriction: 'open'
            };

            try {
              const [success, result] = await recordAPI.createRecord(recordData, projectData.id, item.id);
              if (success) {
                totalRecordsCreated++;
                const recordId = result.id;

                // Upload 1-3 random test files to the textual record
                const filesToUpload = Math.floor(Math.random() * 3) + 1;
                const files = [];

                for (let f = 0; f < filesToUpload; f++) {
                  const testFile = await getRandomTestFile('Tekstuāls', categorizedFiles);
                  if (testFile) {
                    files.push(testFile);
                  }
                }

                if (files.length > 0) {
                  try {
                    const [uploadSuccess, uploadResult] = await recordAPI.uploadMultipleFiles(
                      projectData.id,
                      recordId,
                      files
                    );
                    if (uploadSuccess) {
                      totalFilesUploaded += files.length;
                      addLog(`✓ Izveidots tekstuāls ieraksts ar ${files.length} failiem GV #${item.number}`, 'success');
                    } else {
                      failedFiles += files.length;
                      addLog(`✗ Kļūda augšupielādējot failus: ${uploadResult}`, 'error');
                    }
                  } catch (error) {
                    failedFiles += files.length;
                    addLog(`✗ Kļūda augšupielādējot failus: ${error.message}`, 'error');
                  }
                }

                // Populate metadata (visas, addressees, actions, read statuses)
                const { created: metaCreated, failed: metaFailed } = await generateMetadataForRecord(
                  recordAPI.addMetadata, projectData.id, recordId, recordDate
                );
                totalMetadataCreated.visas += metaCreated.visas;
                totalMetadataCreated.addressees += metaCreated.addressees;
                totalMetadataCreated.actions += metaCreated.actions;
                totalMetadataCreated.read_statuses += metaCreated.read_statuses;
                totalMetadataFailed += metaFailed;
                if (metadataTotal(metaCreated) > 0) {
                  addLog(`  -> Metadati: ${metadataSummary(metaCreated)}`, 'info');
                }
              } else {
                failedRecords++;
                addLog(`✗ Kļūda veidojot ierakstu GV #${item.number}: ${result}`, 'error');
              }
            } catch (error) {
              failedRecords++;
              addLog(`✗ Kļūda veidojot ierakstu: ${error.message}`, 'error');
            }
          }
        }
      }

      // Invalidate queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', projectData.id] });

      addLog('════════════════════════════════════', 'info');
      addLog(`PABEIGTS!`, 'success');
      addLog(`Glabājamās vienības: ${totalItemsCreated} izveidotas, ${failedItems} kļūdas`, totalItemsCreated > 0 ? 'success' : 'error');
      addLog(`Ieraksti: ${totalRecordsCreated} izveidoti, ${failedRecords} kļūdas`, totalRecordsCreated > 0 ? 'success' : 'error');
      addLog(`Faili: ${totalFilesUploaded} augšupielādēti, ${failedFiles} kļūdas`, totalFilesUploaded > 0 ? 'success' : 'error');
      const metaSum = metadataTotal(totalMetadataCreated);
      addLog(`Metadati: ${metaSum} izveidoti (${metadataSummary(totalMetadataCreated)}), ${totalMetadataFailed} kludas`, metaSum > 0 ? 'success' : 'error');
    } catch (error) {
      addLog(`✗ Kļūda populējot uzskaites sarakstus: ${error.message}`, 'error');
      console.error('Populate report inventories error:', error);
    } finally {
      setIsPopulatingReports(false);
    }
  };

  const actions = [
    {
      id: 'clear-cache',
      label: 'Clear React Query Cache',
      icon: 'fa-trash-alt',
      color: 'danger',
      action: () => {
        queryClient.clear();
        addLog('React Query cache cleared', 'success');
      }
    },
    {
      id: 'invalidate-projects',
      label: 'Invalidate Projects Query',
      icon: 'fa-sync-alt',
      color: 'primary',
      action: () => {
        queryClient.invalidateQueries({ queryKey: ['projects'] });
        addLog('Projects query invalidated - will refetch', 'success');
      }
    },
    {
      id: 'clear-settings',
      label: 'Reset Settings to Default',
      icon: 'fa-undo',
      color: 'warning',
      action: () => {
        if (window.confirm('Reset all settings to defaults?')) {
          localStorage.removeItem('opex_settings');
          addLog('Settings reset to defaults', 'success');
          window.location.reload();
        }
      }
    },
    {
      id: 'clear-localStorage',
      label: 'Clear All LocalStorage',
      icon: 'fa-eraser',
      color: 'danger',
      action: () => {
        if (window.confirm('Clear ALL localStorage? This will log you out and reset all settings!')) {
          localStorage.clear();
          addLog('LocalStorage cleared', 'success');
          setTimeout(() => window.location.reload(), 1000);
        }
      }
    },
    {
      id: 'reload-page',
      label: 'Hard Reload Page',
      icon: 'fa-redo',
      color: 'primary',
      action: () => {
        window.location.reload(true);
      }
    },
    {
      id: 'log-state',
      label: 'Log Query Cache to Console',
      icon: 'fa-bug',
      color: 'info',
      action: () => {
        const cache = queryClient.getQueryCache().getAll();
        console.log('React Query Cache:', cache);
        console.log('Projects:', queryClient.getQueryData(['projects']));
        addLog('Cache logged to console', 'info');
      }
    },
    {
      id: 'memory-usage',
      label: 'Check Memory Usage',
      icon: 'fa-memory',
      color: 'info',
      action: () => {
        if (performance.memory) {
          const used = (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2);
          const total = (performance.memory.totalJSHeapSize / 1024 / 1024).toFixed(2);
          const limit = (performance.memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2);
          addLog(`Memory: ${used}MB / ${total}MB (Limit: ${limit}MB)`, 'info');
        } else {
          addLog('Memory API not available', 'warning');
        }
      }
    },
    {
      id: 'network-status',
      label: 'Check Network Status',
      icon: 'fa-wifi',
      color: 'info',
      action: () => {
        const online = navigator.onLine;
        const connection = navigator.connection;
        let message = online ? 'Online' : 'Offline';
        if (connection) {
          message += ` | ${connection.effectiveType || 'Unknown'} | ${connection.downlink || '?'}Mbps`;
        }
        addLog(message, online ? 'success' : 'error');
      }
    },
    {
      id: 'test-error',
      label: 'Trigger Test Error',
      icon: 'fa-exclamation-triangle',
      color: 'danger',
      action: () => {
        try {
          throw new Error('This is a test error for debugging');
        } catch (e) {
          console.error(e);
          addLog('Test error thrown - check console', 'error');
        }
      }
    },
    {
      id: 'copy-env',
      label: 'Copy Environment Info',
      icon: 'fa-clipboard',
      color: 'info',
      action: () => {
        const info = {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          language: navigator.language,
          cookiesEnabled: navigator.cookieEnabled,
          online: navigator.onLine,
          screen: {
            width: window.screen.width,
            height: window.screen.height,
            availWidth: window.screen.availWidth,
            availHeight: window.screen.availHeight
          },
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight
          },
          localStorage: {
            available: typeof localStorage !== 'undefined',
            itemCount: localStorage.length
          },
          reactQuery: {
            cachedQueries: queryClient.getQueryCache().getAll().length
          }
        };
        navigator.clipboard.writeText(JSON.stringify(info, null, 2));
        addLog('Environment info copied to clipboard', 'success');
      }
    },
    {
      id: 'toggle-generator',
      label: showGenerator ? 'Hide Test Data Generator' : 'Show Test Data Generator',
      icon: 'fa-database',
      color: 'primary',
      action: () => {
        setShowGenerator(!showGenerator);
        addLog(showGenerator ? 'Test Data Generator hidden' : 'Test Data Generator shown', 'info');
      }
    },
    {
      id: 'bulk-delete-inventories',
      label: 'Bulk Delete All Inventories',
      icon: 'fa-trash-alt',
      color: 'danger',
      action: bulkDeleteInventories,
      disabled: isDeletingInventories || isDeletingItems || !projectData?.institution?.fond?.inventories?.length
    },
    {
      id: 'bulk-delete-items',
      label: 'Bulk Delete All Items',
      icon: 'fa-box',
      color: 'danger',
      action: bulkDeleteItems,
      disabled: isDeletingInventories || isDeletingItems || !projectData?.institution?.fond?.inventories?.some(inv => inv.items?.length > 0)
    },
    {
      id: 'populate-report-inventories',
      label: 'Populate Report Inventories',
      icon: 'fa-file-upload',
      color: 'primary',
      action: populateReportInventories,
      disabled: isDeletingInventories || isDeletingItems || isPopulatingReports || !projectData?.institution?.fond?.inventories?.some(inv => inv.from_report)
    }
  ];

  return (
    <div className="dev-panel-section">
      <div className="dev-panel-header">
        <h3>Quick Actions</h3>
        <div className="dev-panel-actions">
          <button onClick={clearLogs} className="dev-action-btn" title="Clear logs">
            <i className="fas fa-trash"></i>
          </button>
        </div>
      </div>

      <div className="dev-panel-body">
        <div className="quick-actions-grid">
          {actions.map(action => {
            const isSpinning =
              (action.id === 'bulk-delete-inventories' && isDeletingInventories) ||
              (action.id === 'bulk-delete-items' && isDeletingItems) ||
              (action.id === 'populate-report-inventories' && isPopulatingReports);

            return (
              <button
                key={action.id}
                onClick={action.action}
                className={`quick-action-btn ${action.color}`}
                title={action.label}
                disabled={action.disabled}
              >
                <i className={`fas ${isSpinning ? 'fa-spinner fa-spin' : action.icon}`}></i>
                <span>{action.label}</span>
              </button>
            );
          })}
        </div>

        {/* Action Logs */}
        {logs.length > 0 && (
          <div className="action-logs">
            <h4>Action Log</h4>
            <div className="log-list">
              {logs.map((log, index) => (
                <div key={index} className={`log-entry ${log.type}`}>
                  <span className="log-time">{log.timestamp}</span>
                  <span className="log-message">{log.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="dev-info-panel">
        <h4>Environment Info</h4>
        <table className="info-table">
          <tbody>
            <tr>
              <td>Node Env:</td>
              <td><code>{process.env.NODE_ENV}</code></td>
            </tr>
            <tr>
              <td>React Version:</td>
              <td><code>{React.version}</code></td>
            </tr>
            <tr>
              <td>User Agent:</td>
              <td><code>{navigator.userAgent.slice(0, 50)}...</code></td>
            </tr>
            <tr>
              <td>Cached Queries:</td>
              <td><code>{queryClient.getQueryCache().getAll().length}</code></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Test Data Generator */}
      {showGenerator && (
        <TestDataGenerator projectData={projectData} onLog={addLog} />
      )}
    </div>
  );
};

export default QuickActions;
