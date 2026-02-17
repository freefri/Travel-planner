import JSZip from 'jszip';
import { KMZData, Place, Coordinates, ExtendedData, MWMLang } from '../types/travel';

const MWM_NS = 'https://omaps.app';

export async function parseKMZ(file: Blob | File): Promise<KMZData> {
    let kmlText: string;
    const fileName = (file as File).name || '';

    if (fileName.endsWith('.kmz') || file.type === 'application/vnd.google-earth.kmz') {
        const zip = await JSZip.loadAsync(file);
        const kmlFile = zip.file(/.*\.kml$/i)[0];
        if (!kmlFile) {
            throw new Error('No KML file found in KMZ archive');
        }
        kmlText = await kmlFile.async('text');
    } else {
        kmlText = await file.text();
    }

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(kmlText, 'text/xml');

    const errorNode = xmlDoc.querySelector('parsererror');
    if (errorNode) {
        throw new Error('Error parsing KML XML');
    }

    return parseKML(xmlDoc);
}

function parseKML(xmlDoc: Document): KMZData {
    const documentNode = xmlDoc.getElementsByTagName('Document')[0];
    if (!documentNode) {
        throw new Error('Invalid KML: No Document node found');
    }

    const name = documentNode.querySelector(':scope > name')?.textContent || 'Untitled Travel';

    // Extract global ExtendedData if exists
    const globalExtendedData = documentNode.querySelector(':scope > ExtendedData');
    const lastModified = globalExtendedData?.getElementsByTagNameNS(MWM_NS, 'lastModified')[0]?.textContent ||
        globalExtendedData?.querySelector('lastModified')?.textContent || undefined;

    const placemarks = xmlDoc.querySelectorAll('Placemark');
    const places: Place[] = Array.from(placemarks).map((pm, index) => {
        const nameNode = pm.querySelector('name');
        const name = nameNode?.textContent || 'Unnamed Place';
        const description = pm.querySelector('description')?.textContent || undefined;
        const styleUrl = pm.querySelector('styleUrl')?.textContent || undefined;
        const timestamp = pm.querySelector('TimeStamp > when')?.textContent || undefined;

        const coordString = pm.querySelector('Point > coordinates')?.textContent?.trim() || '';
        const coordinates = parseCoordinates(coordString);

        const extendedData = parseExtendedData(pm.querySelector('ExtendedData'));

        return {
            id: `place-${index}-${Date.now()}`,
            name,
            description,
            timestamp,
            styleUrl,
            coordinates,
            extendedData,
        };
    });

    return {
        name,
        places,
        lastModified,
    };
}

function parseCoordinates(coordString: string): Coordinates {
    const parts = coordString.split(',').map(p => parseFloat(p.trim()));
    return {
        lng: parts[0] || 0,
        lat: parts[1] || 0,
        alt: parts[2],
    };
}

function parseExtendedData(el: Element | null): ExtendedData | undefined {
    if (!el) return undefined;

    const data: ExtendedData = {};

    const getMWMTag = (parent: Element, tagName: string) => {
        return parent.getElementsByTagNameNS(MWM_NS, tagName)[0] || parent.getElementsByTagName(tagName)[0];
    };

    const getMWMLangs = (tagName: string): MWMLang[] | undefined => {
        const parent = getMWMTag(el, tagName);
        if (!parent) return undefined;

        const langs = Array.from(parent.getElementsByTagNameNS(MWM_NS, 'lang')).concat(
            Array.from(parent.getElementsByTagName('lang'))
        ).map(langEl => ({
            code: langEl.getAttribute('code') || 'default',
            value: langEl.textContent || '',
        }));

        return langs.length > 0 ? langs : undefined;
    };

    data.name = getMWMLangs('name');
    data.description = getMWMLangs('description');
    data.customName = getMWMLangs('customName');

    const featureTypesParent = getMWMTag(el, 'featureTypes');
    if (featureTypesParent) {
        data.featureTypes = Array.from(featureTypesParent.getElementsByTagNameNS(MWM_NS, 'value'))
            .concat(Array.from(featureTypesParent.getElementsByTagName('value')))
            .map(v => v.textContent || '')
            .filter(Boolean);
    }

    data.scale = parseInt(getMWMTag(el, 'scale')?.textContent || '') || undefined;
    data.icon = getMWMTag(el, 'icon')?.textContent || undefined;
    data.visibility = getMWMTag(el, 'visibility')?.textContent === '1';
    data.accessRules = getMWMTag(el, 'accessRules')?.textContent || undefined;
    data.annotation = getMWMTag(el, 'annotation')?.textContent || undefined;

    return data;
}
export async function exportKMZ(data: KMZData): Promise<Blob> {
    const kml = generateKML(data);
    const zip = new JSZip();
    zip.file('doc.kml', kml);
    return await zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.google-earth.kmz' });
}

function generateKML(data: KMZData): string {
    const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>\n';
    const kmlOpen = '<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2" xmlns:mwm="https://omaps.app">\n<Document>\n';
    const kmlClose = '</Document>\n</kml>';

    let content = `  <name>${escapeXML(data.name)}</name>\n`;

    if (data.lastModified) {
        content += `  <ExtendedData>\n    <mwm:lastModified>${data.lastModified}</mwm:lastModified>\n  </ExtendedData>\n`;
    }

    data.places.forEach(place => {
        content += '  <Placemark>\n';
        content += `    <name>${escapeXML(place.name)}</name>\n`;
        if (place.description) {
            content += `    <description>${escapeXML(place.description)}</description>\n`;
        }
        if (place.timestamp) {
            content += `    <TimeStamp><when>${place.timestamp}</when></TimeStamp>\n`;
        }
        if (place.styleUrl) {
            content += `    <styleUrl>${escapeXML(place.styleUrl)}</styleUrl>\n`;
        }

        content += `    <Point><coordinates>${place.coordinates.lng},${place.coordinates.lat}${place.coordinates.alt !== undefined ? ',' + place.coordinates.alt : ''}</coordinates></Point>\n`;

        if (place.extendedData) {
            content += '    <ExtendedData>\n';
            const ed = place.extendedData;

            const writeLangs = (tagName: string, langs?: MWMLang[]) => {
                if (!langs) return '';
                let res = `      <mwm:${tagName}>\n`;
                langs.forEach(l => {
                    res += `        <mwm:lang code="${l.code}">${escapeXML(l.value)}</mwm:lang>\n`;
                });
                res += `      </mwm:${tagName}>\n`;
                return res;
            };

            content += writeLangs('name', ed.name);
            content += writeLangs('description', ed.description);
            content += writeLangs('customName', ed.customName);

            if (ed.featureTypes && ed.featureTypes.length > 0) {
                content += '      <mwm:featureTypes>\n';
                ed.featureTypes.forEach(t => {
                    content += `        <mwm:value>${escapeXML(t)}</mwm:value>\n`;
                });
                content += '      </mwm:featureTypes>\n';
            }

            if (ed.scale) content += `      <mwm:scale>${ed.scale}</mwm:scale>\n`;
            if (ed.icon) content += `      <mwm:icon>${escapeXML(ed.icon)}</mwm:icon>\n`;
            if (ed.visibility !== undefined) content += `      <mwm:visibility>${ed.visibility ? '1' : '0'}</mwm:visibility>\n`;
            if (ed.accessRules) content += `      <mwm:accessRules>${escapeXML(ed.accessRules)}</mwm:accessRules>\n`;
            if (ed.annotation) content += `      <mwm:annotation>${escapeXML(ed.annotation)}</mwm:annotation>\n`;

            content += '    </ExtendedData>\n';
        }

        content += '  </Placemark>\n';
    });

    return xmlHeader + kmlOpen + content + kmlClose;
}

function escapeXML(str: string): string {
    return str.replace(/[<>&"']/g, (c) => {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '"': return '&quot;';
            case "'": return '&apos;';
            default: return c;
        }
    });
}
