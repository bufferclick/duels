export interface StageDef {
  id: string;
  name: string;
  subtitle: string;
  palette: { skyTop: string; skyBottom: string; ground: string; accent: string; };
  ambient: string;
}

export const STAGES: StageDef[] = [
  {
    id: 'rooftop',
    name: 'NEON ROOFTOP',
    subtitle: 'Rain-soaked city, 3AM',
    palette: { skyTop: '#0A0A1A', skyBottom: '#1A1A2E', ground: '#1A1A24', accent: '#FF2E63' },
    ambient: 'Distant sirens, rain patter, neon hum'
  },
  {
    id: 'warehouse',
    name: 'WAREHOUSE DISTRICT',
    subtitle: 'Abandoned industrial zone',
    palette: { skyTop: '#1A150A', skyBottom: '#2A2010', ground: '#2B2418', accent: '#FFB020' },
    ambient: 'Wind through girders, flickering fluorescents'
  },
  {
    id: 'desert',
    name: 'CRACKED WASTELAND',
    subtitle: 'Blood-orange dusk',
    palette: { skyTop: '#FF6B35', skyBottom: '#7A1A1A', ground: '#3A1A0A', accent: '#FFD60A' },
    ambient: 'Desert wind, distant thunder'
  }
];
