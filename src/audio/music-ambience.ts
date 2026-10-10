import { audio } from './audio-engine';
export function playStageAmbience(stageId:string){ audio.startAmbience(stageId); }
export function stopAmbience(){ audio.stopAmbience(); }
