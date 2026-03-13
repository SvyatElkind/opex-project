import { useState } from 'react';
import Inventory_API from '../../API/Inventory_API';
import Item_API from '../../API/Item_API';
import Record_API from '../../API/Record_API';
import { INVENTORY_CONSTANTS } from '../../Constants/Constants';

/**
 * Test Data Generator Component
 * Generates test data for development purposes:
 * - 10 inventories (distributed across all types)
 * - 100+ items (distributed across inventories)
 * - Multiple records (1:1 for media, one-to-many for textual)
 */
const TestDataGenerator = ({ projectData, onLog }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, status: '' });
  const [config, setConfig] = useState({
    totalInventories: 10,
    totalItems: 100,
    recordsPerTextualItem: 3 // For textual items
  });

  const inventoryAPI = Inventory_API();
  const itemAPI = Item_API();
  const recordAPI = Record_API();

  // Generate random date within a range
  const randomDate = (start, end) => {
    const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return date.toISOString().split('T')[0];
  };

  // Generate series code in format like "1.1" or "1.12.1" or "4.65.1"
  const generateSeriesCode = () => {
    const part1 = Math.floor(Math.random() * 20) + 1; // 1-20
    const part2 = Math.floor(Math.random() * 99) + 1; // 1-99
    const useThirdPart = Math.random() > 0.5;

    if (useThirdPart) {
      const part3 = Math.floor(Math.random() * 99) + 1; // 1-99
      return `${part1}.${part2}.${part3}`;
    }
    return `${part1}.${part2}`;
  };

  // Generate random name from predefined lists
  const randomName = (type) => {
    const names = {
      'Foto': [
        'Arhīva fotogrāfija', 'Dokumenta attēls', 'Vēsturiska fotokopija',
        'Darba grupa sanāksmē', 'Konferences materiāli', 'Projekta dokumentācija',
        'Biroja telpu foto', 'Pasākuma foto', 'Objekta foto', 'Personas fotoattēls'
      ],
      'Video': [
        'Konferences ieraksts', 'Intervija', 'Prezentācija', 'Sanāksmes video',
        'Apmācības materiāls', 'Projekta demonstrācija', 'Pasākuma ieraksts',
        'Dokumentālais video', 'Vēsturiskais ieraksts', 'Darba process'
      ],
      'Skaņas': [
        'Audio intervija', 'Konferences audio', 'Sanāksmes ieraksts',
        'Prezentācijas audio', 'Apmācības materiāls', 'Diktofonā ieraksts',
        'Telefona saruna', 'Radio intervija', 'Ziņojums', 'Instrukcija'
      ],
      'Tekstuāls': [
        'Darba līgums', 'Vienošanās', 'Protokols', 'Atskaite', 'Plāns',
        'Instrukcija', 'Norādījumi', 'Rīkojums', 'Lēmums', 'Apraksts',
        'Analīze', 'Pārskats', 'Dokumentācija', 'Specifikācija', 'Projekts'
      ]
    };
    const list = names[type] || names['Tekstuāls'];
    return list[Math.floor(Math.random() * list.length)];
  };

  // Generate test data
  const generateTestData = async () => {
    if (!projectData?.id || !projectData?.institution?.fond?.id) {
      onLog('Kļūda: Nav aktīvs projekts vai fonds', 'error');
      return;
    }

    setIsGenerating(true);
    onLog('Sāk ģenerēt testa datus...', 'info');

    const projectId = projectData.id;
    const fondId = projectData.institution.fond.id;

    const startYear = 2020;
    const endYear = 2025;

    try {
      // Step 1: Create inventories
      const inventoryTypes = INVENTORY_CONSTANTS.TYPE; // ['Foto', 'Skaņas', 'Tekstuāls', 'Video']
      const createdInventories = [];
      const inventoriesPerType = Math.floor(config.totalInventories / inventoryTypes.length);
      const remainder = config.totalInventories % inventoryTypes.length;

      // Get current inventory count to auto-increment numbers
      const currentInventoryCount = projectData?.institution?.fond?.inventories?.length || 0;

      setProgress({ current: 0, total: config.totalInventories, status: 'Izveido uzskaites sarakstus...' });
      onLog(`Izveido ${config.totalInventories} uzskaites sarakstus...`, 'info');

      let inventoryIndex = 0;
      for (let typeIndex = 0; typeIndex < inventoryTypes.length; typeIndex++) {
        const type = inventoryTypes[typeIndex];
        const count = inventoriesPerType + (typeIndex < remainder ? 1 : 0);
        const isElectronic = true; // All test inventories are electronic

        for (let i = 0; i < count; i++) {
          const year = startYear + Math.floor(Math.random() * (endYear - startYear + 1));
          const startDate = `${year}-01-01`;
          const endDate = `${year}-12-31`;

          // Calculate inventory number (current count + index + 1)
          const inventoryNumber = currentInventoryCount + inventoryIndex + 1;

          const inventoryData = {
            number: inventoryNumber,
            electronic: isElectronic,
            type: type,
            subfond: Math.floor(Math.random() * 10) + 1, // Random subfond 1-10
            storage_term: INVENTORY_CONSTANTS.TERMS[0], // "Pastāvīgi glabājamās lietas"
            start_date: startDate,
            end_date: endDate
          };

          const [success, result] = await inventoryAPI.createInventory(projectId, fondId, inventoryData);

          if (success) {
            createdInventories.push(result);
            inventoryIndex++;
            setProgress({ current: inventoryIndex, total: config.totalInventories, status: `Izveidoti ${inventoryIndex}/${config.totalInventories} uzskaites saraksti` });
          } else {
            onLog(`Kļūda izveidojot uzskaites sarakstu: ${result}`, 'error');
          }
        }
      }

      onLog(`✓ Izveidoti ${createdInventories.length} uzskaites saraksti`, 'success');

      // Step 2: Create items
      const itemsPerInventory = Math.floor(config.totalItems / createdInventories.length);
      const itemsRemainder = config.totalItems % createdInventories.length;
      const createdItems = [];

      setProgress({ current: 0, total: config.totalItems, status: 'Izveido glabājamās vienības...' });
      onLog(`Izveido ${config.totalItems} glabājamās vienības...`, 'info');

      let itemIndex = 0;
      for (let invIndex = 0; invIndex < createdInventories.length; invIndex++) {
        const inventory = createdInventories[invIndex];
        const itemCount = itemsPerInventory + (invIndex < itemsRemainder ? 1 : 0);
        const isMediaType = INVENTORY_CONSTANTS.MEDIA_TYPES.includes(inventory.type);

        for (let i = 0; i < itemCount; i++) {
          const itemNumber = i + 1;

          // Generate dates ensuring start_date <= end_date
          const invStartDate = new Date(inventory.start_date);
          const invEndDate = new Date(inventory.end_date);
          const itemStartDate = randomDate(invStartDate, invEndDate);
          const itemEndDate = randomDate(new Date(itemStartDate), invEndDate); // End date must be >= start date

          const itemData = {
            number: itemNumber,
            title: `${randomName(inventory.type)} ${itemNumber}`, // Changed from 'name' to 'title'
            start_date: itemStartDate,
            end_date: itemEndDate,
            language: 'Latviešu',
            series_code: generateSeriesCode(), // Generate proper format like "1.12" or "1.12.1"
            volume: Math.floor(Math.random() * 100) + 1,
            volume_unit: 'Lapas'
          };

          // For media types, notes and annotation fields are required
          if (isMediaType) {
            itemData.notes = `Testa ${inventory.type} vienība nr. ${itemNumber}`;
            itemData.annotation = `${inventory.type} materiāla detalizēts apraksts - vienība ${itemNumber}. Satur kvalitatīvu ${inventory.type.toLowerCase()} saturu testēšanas nolūkiem.`;
          } else {
            // For textual, notes and annotation are optional but we'll add them anyway
            itemData.notes = `Testa tekstuāla vienība nr. ${itemNumber}`;
            itemData.annotation = `Tekstuāla materiāla detalizēts apraksts - vienība ${itemNumber}`;
          }

          const [success, result] = await itemAPI.createItem(itemData, projectId, inventory.id);

          if (success) {
            createdItems.push({ ...result, inventoryType: inventory.type, inventoryId: inventory.id });
            itemIndex++;
            setProgress({ current: itemIndex, total: config.totalItems, status: `Izveidotas ${itemIndex}/${config.totalItems} glabājamās vienības` });
          } else {
            onLog(`Kļūda izveidojot glabājamo vienību: ${result}`, 'error');
          }
        }
      }

      onLog(`✓ Izveidotas ${createdItems.length} glabājamās vienības`, 'success');

      // Step 2.5: Fetch project data again to get actual item IDs
      onLog('Iegūst izveidoto vienību ID...', 'info');
      const projectResponse = await fetch(`/api/v1/project/${projectId}/`);
      if (!projectResponse.ok) {
        onLog('Kļūda iegūstot projekta datus ar vienību ID', 'error');
        return;
      }
      const updatedProjectData = await projectResponse.json();

      // Map items with their actual IDs from the project response
      const itemsWithIds = [];
      if (updatedProjectData?.institution?.fond?.inventories) {
        for (const inventory of updatedProjectData.institution.fond.inventories) {
          if (inventory.items && inventory.items.length > 0) {
            for (const item of inventory.items) {
              itemsWithIds.push({
                id: item.id,
                inventoryType: inventory.type,
                inventoryId: inventory.id,
                start_date: item.start_date,
                end_date: item.end_date,
                number: item.number
              });
            }
          }
        }
      }

      onLog(`✓ Iegūti ${itemsWithIds.length} vienību ID`, 'success');

      // Step 3: Create records using the items with actual IDs
      const mediaTypes = INVENTORY_CONSTANTS.MEDIA_TYPES; // ['Foto', 'Skaņas', 'Video']
      const totalRecordsEstimate = itemsWithIds.reduce((sum, item) => {
        return sum + (mediaTypes.includes(item.inventoryType) ? 1 : config.recordsPerTextualItem);
      }, 0);

      setProgress({ current: 0, total: totalRecordsEstimate, status: 'Izveido ierakstus...' });
      onLog(`Izveido ierakstus (paredzēti ~${totalRecordsEstimate})...`, 'info');

      let recordIndex = 0;
      for (const item of itemsWithIds) {
        const isMedia = mediaTypes.includes(item.inventoryType);
        const recordCount = isMedia ? 1 : config.recordsPerTextualItem;

        for (let i = 0; i < recordCount; i++) {
          const recordData = {
            title: `${randomName(item.inventoryType)} ${i + 1}`, // Changed from 'name' to 'title'
            date: randomDate(new Date(item.start_date), new Date(item.end_date)),
            language: 'Latviešu',
            reg_nr: `REG-${Math.floor(Math.random() * 10000)}`,
            notes: `Testa ${item.inventoryType} ieraksts nr. ${i + 1}`,
            annotation: `Detalizēts apraksts ierakstam ${i + 1}`,
            key_words: 'tests, dokumentācija, arhīvs',
            access_restriction: 'open'
          };

          const [success, result] = await recordAPI.createRecord(recordData, projectId, item.id);

          if (success) {
            recordIndex++;
            setProgress({ current: recordIndex, total: totalRecordsEstimate, status: `Izveidoti ${recordIndex}/${totalRecordsEstimate} ieraksti` });
          } else {
            onLog(`Kļūda izveidojot ierakstu: ${result}`, 'error');
          }
        }
      }

      onLog(`✓ Izveidoti ${recordIndex} ieraksti`, 'success');
      onLog('════════════════════════════════════', 'info');
      onLog('✓ Testa datu ģenerēšana pabeigta!', 'success');
      onLog(`  - ${createdInventories.length} uzskaites saraksti`, 'info');
      onLog(`  - ${itemsWithIds.length} glabājamās vienības`, 'info');
      onLog(`  - ${recordIndex} ieraksti`, 'info');
      onLog('  - Failus var pievienot manuāli', 'info');

    } catch (error) {
      onLog(`Kļūda ģenerējot datus: ${error.message}`, 'error');
      console.error('Test data generation error:', error);
    } finally {
      setIsGenerating(false);
      setProgress({ current: 0, total: 0, status: '' });
    }
  };

  if (!projectData?.id) {
    return (
      <div className="test-data-generator">
        <div className="dev-panel-header">
          <h4>
            <i className="fas fa-database"></i>
            Testa Datu Ģenerators
          </h4>
        </div>
        <div className="generator-warning">
          <i className="fas fa-exclamation-triangle"></i>
          <p>Lūdzu, vispirms izvēlieties vai izveidojiet projektu</p>
        </div>
      </div>
    );
  }

  return (
    <div className="test-data-generator">
      <div className="dev-panel-header">
        <h4>
          <i className="fas fa-database"></i>
          Testa Datu Ģenerators
        </h4>
      </div>

      <div className="generator-body">
        {/* Configuration */}
        <div className="generator-config">
          <div className="config-row">
            <label>Uzskaites saraksti:</label>
            <input
              type="number"
              min="4"
              max="50"
              value={config.totalInventories}
              onChange={(e) => setConfig({ ...config, totalInventories: parseInt(e.target.value) || 10 })}
              disabled={isGenerating}
            />
          </div>

          <div className="config-row">
            <label>Glabājamās vienības:</label>
            <input
              type="number"
              min="10"
              max="500"
              value={config.totalItems}
              onChange={(e) => setConfig({ ...config, totalItems: parseInt(e.target.value) || 100 })}
              disabled={isGenerating}
            />
          </div>

          <div className="config-row">
            <label>Ieraksti uz tekstuālo vienību:</label>
            <input
              type="number"
              min="1"
              max="10"
              value={config.recordsPerTextualItem}
              onChange={(e) => setConfig({ ...config, recordsPerTextualItem: parseInt(e.target.value) || 3 })}
              disabled={isGenerating}
            />
          </div>
        </div>

        {/* Info */}
        <div className="generator-info">
          <p>
            <i className="fas fa-info-circle"></i>
            <strong>Ģenerēs:</strong>
          </p>
          <ul>
            <li>{config.totalInventories} uzskaites sarakstus (visi tipi)</li>
            <li>{config.totalItems} glabājamās vienības</li>
            <li>~{Math.floor(config.totalItems * 0.4) + Math.floor(config.totalItems * 0.6 * config.recordsPerTextualItem)} ierakstus</li>
            <li>Failus pievienojiet manuāli</li>
          </ul>
        </div>

        {/* Progress */}
        {isGenerating && (
          <div className="generator-progress">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${(progress.current / progress.total) * 100}%` }}
              />
            </div>
            <p className="progress-status">{progress.status}</p>
          </div>
        )}

        {/* Actions */}
        <div className="generator-actions">
          <button
            className="generate-btn"
            onClick={generateTestData}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Ģenerē...
              </>
            ) : (
              <>
                <i className="fas fa-play"></i>
                Ģenerēt Testa Datus
              </>
            )}
          </button>
        </div>

        {/* Warning */}
        <div className="generator-warning">
          <i className="fas fa-exclamation-triangle"></i>
          <p>
            <strong>Brīdinājums:</strong> Šī funkcija izveidos daudz datu aktīvajā projektā.
            Izmantojiet tikai testēšanas nolūkiem!
          </p>
        </div>
      </div>
    </div>
  );
};

export default TestDataGenerator;
