export interface Coordinates {
    lat: number;
    lng: number;
    alt?: number;
}

export interface MWMLang {
    code: string;
    value: string;
}

export interface ExtendedData {
    name?: MWMLang[];
    description?: MWMLang[];
    featureTypes?: string[];
    scale?: number;
    icon?: string;
    visibility?: boolean;
    customName?: MWMLang[];
    accessRules?: string;
    annotation?: string;
}

export interface Place {
    id: string;
    name: string;
    description?: string;
    timestamp?: string; // ISO string from <when>
    styleUrl?: string;
    coordinates: Coordinates;
    extendedData?: ExtendedData;
}

export interface KMZData {
    name: string;
    places: Place[];
    lastModified?: string;
}
