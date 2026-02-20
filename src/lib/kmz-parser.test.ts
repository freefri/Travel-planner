import { describe, it, expect } from 'vitest';
import { parseKMZ, exportKMZ } from './kmz-parser';
import { KMZData } from '../types/travel';
import JSZip from 'jszip';

// Helper to create a KML string for testing
const createKML = (name: string, description: string = '') => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:mwm="https://omaps.app">
  <Document>
    <name>Test Document</name>
    <ExtendedData>
      <mwm:lastModified>2026-02-19T18:00:00Z</mwm:lastModified>
    </ExtendedData>
    <Placemark>
      <name>${name}</name>
      <description>${description}</description>
      <TimeStamp><when>2026-02-08T17:46:34Z</when></TimeStamp>
      <styleUrl>#placemark-purple</styleUrl>
      <Point><coordinates>130.80279,-0.43252758,0</coordinates></Point>
      <ExtendedData>
        <mwm:name>
          <mwm:lang code="default">Waisai</mwm:lang>
        </mwm:name>
        <mwm:featureTypes>
          <mwm:value>amenity-ferry_terminal</mwm:value>
        </mwm:featureTypes>
        <mwm:scale>16</mwm:scale>
        <mwm:icon>Transport</mwm:icon>
        <mwm:visibility>1</mwm:visibility>
      </ExtendedData>
    </Placemark>
  </Document>
</kml>`;
};

describe('kmz-parser', () => {
  describe('parseKMZ', () => {
    it('should parse a raw KML string (passed as a Blob)', async () => {
      const kml = createKML('17. 18:46 🚌 Waisai', 'Waisai is a town in the south of the island of Waigeo.\n' +
        '&lt;img src=&quot;https://duckduckgo.com/i/waisai.jpg&quot; style=&quot;max-width:300px; display:block; margin: 10px 0;&quot;&gt;');
      const blob = new Blob([kml], { type: 'text/xml' });

      const data = await parseKMZ(blob);

      // console.log(data)
      expect(data.name).toBe('Test Document');
      expect(data.lastModified).toBe('2026-02-19T18:00:00Z');
      expect(data.places).toHaveLength(1);

      const place = data.places[0];
      expect(place.name).toBe('17. 18:46 🚌 Waisai');
      expect(place.description).toBe('Waisai is a town in the south of the island of Waigeo.');
      expect(place.imageUrl).toBe('https://duckduckgo.com/i/waisai.jpg');
      expect(place.coordinates).toEqual({ lng: 130.80279, lat: -0.43252758, alt: 0 });
      expect(place.extendedData?.icon).toBe('Transport');
    });

    it('should parse a KMZ file (zipped KML)', async () => {
      const kml = createKML('Tanah Lot');
      const zip = new JSZip();
      zip.file('doc.kml', kml);
      const blob = await zip.generateAsync({ type: 'blob' });

      // Give it a fileName to trigger KMZ parsing logic
      const file = new File([blob], 'test.kmz', { type: 'application/vnd.google-earth.kmz' });

      const data = await parseKMZ(file);
      expect(data.places).toHaveLength(1);
      expect(data.places[0].name).toBe('Tanah Lot');
    });

    it('should throw an error for invalid XML', async () => {
      const blob = new Blob(['invalid xml'], { type: 'text/xml' });
      await expect(parseKMZ(blob)).rejects.toThrow();
    });
  });

  describe('exportKMZ', () => {
    it('should generate a valid KMZ with embedded images in description', async () => {
      const data: KMZData = {
        name: 'Export Trip',
        places: [{
          id: '1',
          name: 'Bali',
          description: 'Island of Gods',
          imageUrl: 'https://duckduckgo.com/bali.jpg',
          coordinates: { lat: -8, lng: 115 },
          extendedData: { icon: 'Nature' }
        }]
      };

      const blob = await exportKMZ(data);
      expect(blob.type).toBe('application/vnd.google-earth.kmz');

      // Unzip and verify KML content
      const zip = await JSZip.loadAsync(blob);
      const kmlFile = zip.file('doc.kml');
      expect(kmlFile).toBeDefined();

      const kmlText = await kmlFile!.async('text');

      // Check for escaped HTML img tag within description
      expect(kmlText).toContain('&lt;img src=&quot;https://duckduckgo.com/bali.jpg&quot;');
      expect(kmlText).toContain('Island of Gods');
      expect(kmlText).toContain('<mwm:icon>Nature</mwm:icon>');
    });

    it('should correctly escape special XML characters', async () => {
      const data: KMZData = {
        name: 'Special & Characters',
        places: [{
          id: '1',
          name: 'Bread & Butter',
          coordinates: { lat: 0, lng: 0 }
        }]
      };

      const blob = await exportKMZ(data);
      const zip = await JSZip.loadAsync(blob);
      const kmlText = await zip.file('doc.kml')!.async('text');

      expect(kmlText).toContain('Special &amp; Characters');
      expect(kmlText).toContain('Bread &amp; Butter');
    });

    it('should ensure Placemark.name and mwm:customName are identical and follow the DDDD. HH.MM format', async () => {
      const timestamp = '2026-02-08T17:46:34Z';
      const data: KMZData = {
        name: 'Format Trip',
        places: [{
          id: '1',
          name: 'Waisai',
          timestamp: timestamp,
          coordinates: { lat: -0.4, lng: 130.8 },
          extendedData: { icon: 'Transport' }
        }]
      };

      const blob = await exportKMZ(data);
      const zip = await JSZip.loadAsync(blob);
      const kmlText = await zip.file('doc.kml')!.async('text');

      // Calculate expected name based on local time to avoid timezone issues in tests
      const date = new Date(timestamp);
      const hh = date.getHours().toString().padStart(2, '0');
      const mm = date.getMinutes().toString().padStart(2, '0');
      const expectedName = `1. ${hh}:${mm} 🚌 Waisai`;

      // Check Placemark name
      expect(kmlText).toContain(`<name>${expectedName}</name>`);

      // Check mwm:customName
      expect(kmlText).toContain(`<mwm:customName>`);
      expect(kmlText).toContain(`<mwm:lang code="default">${expectedName}</mwm:lang>`);
      expect(kmlText).toContain(`</mwm:customName>`);
    });
  });
});
