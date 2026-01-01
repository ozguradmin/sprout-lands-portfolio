import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { ViewState } from '../../types';
import { 
  ArrowLeft, Save, Trash2, LayoutGrid, Image as ImageIcon, 
  Copy, Check, Scissors, MousePointer2, Upload, FolderOpen, 
  X, Move, Map as MapIcon, Ban, DoorOpen, UserCircle, Settings,
  Plus, Minus, Globe, MousePointer, RotateCcw, Box, Hash, UploadCloud, Eraser, Layers, Maximize
} from 'lucide-react';

const TILE_SIZE = 16;
const SCALE = 3;
const DISPLAY_TILE = TILE_SIZE * SCALE; // 48px

interface PlacedObject {
  id: string;
  assetId: string;
  tx: number;
  ty: number;
  scale?: number;
  isAbovePlayer?: boolean;
}

interface AssetDef {
  id: string;
  source: string;
  x: number;
  y: number;
  w: number;
  h: number;
  name: string;
  isCustom?: boolean;
  scale?: number;
}

interface PortalDef {
  id: string;
  name: string;
  tx: number;
  ty: number;
  tw: number;
  th: number;
  target: string;
  color: string;
}

interface CollisionDef {
  id: string;
  tx: number;
  ty: number;
}

export const AdminView: React.FC = () => {
  const { setCurrentView } = useApp();
  const [activeTool, setActiveTool] = useState<'place' | 'collision' | 'portal' | 'spawn' | 'border' | 'eraser'>('place');
  
  const [mapConfig, setMapConfig] = useState({
    tilesW: 32,
    tilesH: 32,
    spawnTX: 16,
    spawnTY: 16,
    borderAssetId: ''
  });

  const [assets, setAssets] = useState<AssetDef[]>([
    { id: 'tree_1', source: 'Objects/Basic Grass Biom things.png', x: 16, y: 0, w: 32, h: 32, name: 'Yeşil Ağaç' },
    { id: 'house_1', source: 'Tilesets/Wooden House.png', x: 0, y: 0, w: 80, h: 80, name: 'Köy Evi' },
    { id: 'rock_1', source: 'Objects/Basic Grass Biom things.png', x: 96, y: 16, w: 16, h: 16, name: 'Küçük Kaya' },
  ]);

  const [placedObjects, setPlacedObjects] = useState<PlacedObject[]>([]);
  const [collisions, setCollisions] = useState<CollisionDef[]>([]);
  const [portals, setPortals] = useState<PortalDef[]>([
    { id: 'p1', name: 'PROJELER', tx: 10, ty: 8, tw: 2, th: 2, target: 'PORTFOLIO', color: '#6366f1' },
    { id: 'p2', name: 'SOSYAL', tx: 20, ty: 15, tw: 2, th: 2, target: 'ARCADE', color: '#ec4899' },
    { id: 'p3', name: 'GALERİ', tx: 8, ty: 20, tw: 2, th: 2, target: 'GALLERY', color: '#14b8a6' },
  ]);

  const [selectedAsset, setSelectedAsset] = useState<AssetDef | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [copied, setCopied] = useState(false);
  const [portalTarget, setPortalTarget] = useState<string>('PORTFOLIO');
  const [history, setHistory] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fillStart, setFillStart] = useState<{tx: number, ty: number} | null>(null);
  const [ctrlPressed, setCtrlPressed] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const lastPlacedTile = useRef<{tx: number, ty: number} | null>(null);
  const mapContentRef = useRef<HTMLDivElement>(null);
  const cropperImageRef = useRef<HTMLImageElement>(null);

  const sourceFiles = [
    'Characters/Basic Charakter Actions.png',
    'Characters/Basic Charakter Spritesheet.png',
    'Characters/Free Chicken Sprites.png',
    'Characters/Free Cow Sprites.png',
    'Objects/Basic Furniture.png',
    'Objects/Basic Grass Biom things.png',
    'Objects/Basic Grass Biom things 1.png',
    'Objects/Basic_Furniture.png',
    'Objects/Basic_Grass_Biom_things.png',
    'Objects/Basic Plants.png',
    'Objects/Basic_Plants.png',
    'Objects/Basic tools and meterials.png',
    'Objects/Basic_tools_and_meterials.png',
    'Objects/Chest.png',
    'Objects/Egg_item.png',
    'Objects/Free_Chicken_House.png',
    'Objects/Paths.png',
    'Objects/Wood_Bridge.png',
    'Tilesets/Grass.png',
    'Tilesets/Hills.png',
    'Tilesets/Tilled Dirt.png',
    'Tilesets/Water.png',
    'Tilesets/Wooden House.png',
    'Tilesets/Doors.png',
    'Tilesets/Fences.png'
  ];

  const [cropSource, setCropSource] = useState(sourceFiles[5]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState({ x: 0, y: 0 });
  const [currentSelection, setCurrentSelection] = useState({ x: 0, y: 0, w: 16, h: 16 });

  const saveToHistory = useCallback(() => {
    const currentState = JSON.stringify({ placedObjects, collisions, portals, mapConfig });
    setHistory(prev => [currentState, ...prev].slice(0, 20));
  }, [placedObjects, collisions, portals, mapConfig]);

  const undo = useCallback(() => {
    if (history.length === 0) return;
    const prevState = JSON.parse(history[0]);
    setPlacedObjects(prevState.placedObjects);
    setCollisions(prevState.collisions);
    setPortals(prevState.portals);
    setMapConfig(prevState.mapConfig);
    setHistory(prev => prev.slice(1));
  }, [history]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Control') setCtrlPressed(true);
      if (e.ctrlKey && e.key === 'z') undo();
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Control') {
        setCtrlPressed(false);
        setFillStart(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [undo]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleAction = (tx: number, ty: number) => {
    if (tx < 0 || tx >= mapConfig.tilesW || ty < 0 || ty >= mapConfig.tilesH) return;
    
    if (ctrlPressed) {
      if (!fillStart) {
        setFillStart({ tx, ty });
      } else {
        saveToHistory();
        const minX = Math.min(fillStart.tx, tx);
        const maxX = Math.max(fillStart.tx, tx);
        const minY = Math.min(fillStart.ty, ty);
        const maxY = Math.max(fillStart.ty, ty);
        
        if (activeTool === 'place' && selectedAsset) {
          const assetScale = selectedAsset.scale || 1;
          const newObjects: PlacedObject[] = [];
          for (let y = minY; y <= maxY; y++) {
            for (let x = minX; x <= maxX; x++) {
              newObjects.push({ id: Math.random().toString(36).substr(2, 9), assetId: selectedAsset.id, tx: x, ty: y, scale: SCALE * assetScale, isAbovePlayer: false });
            }
          }
          setPlacedObjects(prev => [...prev, ...newObjects]);
        } else if (activeTool === 'collision') {
          const newCollisions: CollisionDef[] = [];
          for (let y = minY; y <= maxY; y++) {
            for (let x = minX; x <= maxX; x++) {
              if (!collisions.find(c => c.tx === x && c.ty === y)) {
                newCollisions.push({ id: Math.random().toString(36).substr(2, 9), tx: x, ty: y });
              }
            }
          }
          setCollisions(prev => [...prev, ...newCollisions]);
        } else if (activeTool === 'eraser') {
          setPlacedObjects(prev => prev.filter(o => o.tx < minX || o.tx > maxX || o.ty < minY || o.ty > maxY));
          setCollisions(prev => prev.filter(c => c.tx < minX || c.tx > maxX || c.ty < minY || c.ty > maxY));
        }
        setFillStart(null);
      }
      return;
    }

    if (lastPlacedTile.current?.tx === tx && lastPlacedTile.current?.ty === ty) return;
    lastPlacedTile.current = { tx, ty };

    if (activeTool === 'eraser') {
      saveToHistory();
      setPlacedObjects(prev => prev.filter(o => o.tx !== tx || o.ty !== ty));
      setCollisions(prev => prev.filter(c => c.tx !== tx || c.ty !== ty));
      return;
    }

    saveToHistory();
    if (activeTool === 'place' && selectedAsset) {
      const assetScale = selectedAsset.scale || 1;
      setPlacedObjects(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), assetId: selectedAsset.id, tx, ty, isAbovePlayer: false, scale: SCALE * assetScale }]);
    } else if (activeTool === 'collision') {
      const existing = collisions.find(c => c.tx === tx && c.ty === ty);
      if (existing) {
        setCollisions(prev => prev.filter(c => c.id !== existing.id));
      } else {
        setCollisions(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), tx, ty }]);
      }
    } else if (activeTool === 'portal') {
      setPortals(prev => prev.map(p => p.target === portalTarget ? { ...p, tx, ty } : p));
    } else if (activeTool === 'spawn') {
      setMapConfig(prev => ({ ...prev, spawnTX: tx, spawnTY: ty }));
    } else if (activeTool === 'border' && selectedAsset) {
      setMapConfig(prev => ({ ...prev, borderAssetId: selectedAsset.id }));
    }
  };

  const handleMapInteraction = (e: React.MouseEvent) => {
    if (!mapContentRef.current) return;
    const rect = mapContentRef.current.getBoundingClientRect();
    const tx = Math.floor((e.clientX - rect.left) / DISPLAY_TILE);
    const ty = Math.floor((e.clientY - rect.top) / DISPLAY_TILE);
    document.documentElement.style.setProperty('--cur-tx', `${tx}`);
    document.documentElement.style.setProperty('--cur-ty', `${ty}`);
    handleAction(tx, ty);
  };

  const toggleLayer = (id: string) => {
    setPlacedObjects(prev => prev.map(o => o.id === id ? { ...o, isAbovePlayer: !o.isAbovePlayer } : o));
  };

  const adjustScale = (id: string) => {
    const obj = placedObjects.find(o => o.id === id);
    const newScale = prompt("Ölçek değeri girin (örn: 1, 3, 0.5):", (obj?.scale || SCALE).toString());
    if (newScale !== null) {
      setPlacedObjects(prev => prev.map(o => o.id === id ? { ...o, scale: parseFloat(newScale) || SCALE } : o));
    }
  };

  const adjustAssetScale = (assetId: string) => {
    const asset = assets.find(a => a.id === assetId);
    const currentScale = asset?.scale || 1;
    const newScale = prompt("Asset ölçek değeri girin (örn: 0.5, 1, 2):", currentScale.toString());
    if (newScale !== null) {
      const scaleValue = parseFloat(newScale);
      if (!isNaN(scaleValue) && scaleValue > 0) {
        setAssets(prev => prev.map(a => a.id === assetId ? { ...a, scale: scaleValue } : a));
      }
    }
  };

  const handleRandomDistribute = (asset: AssetDef) => {
    const count = parseInt(prompt("Kaç adet rastgele dağıtılsın?", "10") || "0");
    if (count <= 0) return;
    saveToHistory();
    const assetScale = asset.scale || 1;
    const newObjects: PlacedObject[] = [];
    for (let i = 0; i < count; i++) {
      newObjects.push({
        id: Math.random().toString(36).substr(2, 9),
        assetId: asset.id,
        tx: Math.floor(Math.random() * mapConfig.tilesW),
        ty: Math.floor(Math.random() * mapConfig.tilesH),
        isAbovePlayer: false,
        scale: SCALE * assetScale
      });
    }
    setPlacedObjects(prev => [...prev, ...newObjects]);
  };

  const handleCustomUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const newAsset: AssetDef = {
          id: `custom_${Date.now()}`,
          source: dataUrl,
          x: 0, y: 0, w: img.width, h: img.height,
          name: file.name,
          isCustom: true,
          scale: 1
        };
        setAssets(prev => [...prev, newAsset]);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleCropperMouseDown = (e: React.MouseEvent) => {
    if (!cropperImageRef.current) return;
    const rect = cropperImageRef.current.getBoundingClientRect();
    const startX = Math.floor((e.clientX - rect.left) / 2 / 16) * 16;
    const startY = Math.floor((e.clientY - rect.top) / 2 / 16) * 16;
    setIsSelecting(true);
    setSelectionStart({ x: startX, y: startY });
    setCurrentSelection({ x: startX, y: startY, w: 16, h: 16 });
  };

  const handleCropperMouseMove = (e: React.MouseEvent) => {
    if (!isSelecting || !cropperImageRef.current) return;
    const rect = cropperImageRef.current.getBoundingClientRect();
    const curX = Math.floor((e.clientX - rect.left) / 2 / 16) * 16;
    const curY = Math.floor((e.clientY - rect.top) / 2 / 16) * 16;
    setCurrentSelection({ ...selectionStart, w: Math.max(16, curX - selectionStart.x + 16), h: Math.max(16, curY - selectionStart.y + 16) });
  };

  const exportJson = () => {
    const data = { 
      mapConfig: {
        width: mapConfig.tilesW * DISPLAY_TILE,
        height: mapConfig.tilesH * DISPLAY_TILE,
        spawnX: mapConfig.spawnTX * DISPLAY_TILE + DISPLAY_TILE/2,
        spawnY: mapConfig.spawnTY * DISPLAY_TILE + DISPLAY_TILE/2,
        scale: SCALE,
        borderAssetId: mapConfig.borderAssetId
      }, 
      assets, 
      objects: placedObjects.map(o => {
        const asset = assets.find(a => a.id === o.assetId);
        return { ...o, x: o.tx * DISPLAY_TILE, y: o.ty * DISPLAY_TILE, scale: o.scale || SCALE, w: asset?.w, h: asset?.h, isAbovePlayer: !!o.isAbovePlayer };
      }),
      collisions: collisions.map(c => ({ ...c, x: c.tx * DISPLAY_TILE, y: c.ty * DISPLAY_TILE, w: DISPLAY_TILE, h: DISPLAY_TILE })), 
      portals: portals.map(p => ({ ...p, x: p.tx * DISPLAY_TILE, y: p.ty * DISPLAY_TILE, w: p.tw * DISPLAY_TILE, h: p.th * DISPLAY_TILE }))
    };
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const borderAsset = assets.find(a => a.id === mapConfig.borderAssetId);
  const selectedPortal = portals.find(p => p.target === portalTarget);

  return (
    <div className="flex h-screen w-screen bg-[#08080a] text-zinc-300 overflow-hidden font-sans select-none">
      <aside className="w-80 border-r border-zinc-800 bg-[#0c0c0f] flex flex-col z-20 shadow-2xl overflow-hidden">
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/30">
           <div className="flex items-center gap-3">
              <button onClick={() => setCurrentView(ViewState.HUB)} className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-all"><ArrowLeft size={18} /></button>
              <h1 className="font-bold text-sm tracking-widest text-white uppercase italic">Designer Pro v5</h1>
           </div>
           <div className="flex gap-1">
             <button onClick={undo} className="p-2 text-zinc-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg" title="Geri Al (Ctrl+Z)"><RotateCcw size={16}/></button>
             <button onClick={() => { const input = prompt("JSON Kodu:"); if(input) { try { const data = JSON.parse(input); if (data.mapConfig) setMapConfig({ tilesW: data.mapConfig.width / DISPLAY_TILE, tilesH: data.mapConfig.height / DISPLAY_TILE, spawnTX: Math.floor(data.mapConfig.spawnX / DISPLAY_TILE), spawnTY: Math.floor(data.mapConfig.spawnY / DISPLAY_TILE), borderAssetId: data.mapConfig.borderAssetId || '' }); setAssets(data.assets || []); setPlacedObjects((data.objects || []).map((o: any) => ({ ...o, tx: o.x / DISPLAY_TILE, ty: o.y / DISPLAY_TILE, isAbovePlayer: !!o.isAbovePlayer, scale: o.scale || SCALE }))); setCollisions((data.collisions || []).map((c: any) => ({ ...c, tx: c.x / DISPLAY_TILE, ty: c.y / DISPLAY_TILE }))); setPortals((data.portals || []).map((p: any) => ({ ...p, tx: p.x / DISPLAY_TILE, ty: p.y / DISPLAY_TILE, tw: p.w / DISPLAY_TILE || 1, th: p.h / DISPLAY_TILE || 1 }))); } catch (e) { alert("Hata!"); } } }} className="p-2 text-zinc-500 hover:text-white"><Upload size={16}/></button>
           </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-hide">
           <section className="grid grid-cols-6 gap-1 bg-zinc-900/50 p-1 rounded-2xl border border-zinc-800/50">
              {[
                { id: 'place', icon: <ImageIcon size={14}/>, label: 'OBJ' },
                { id: 'collision', icon: <Ban size={14}/>, label: 'BLK' },
                { id: 'eraser', icon: <Eraser size={14}/>, label: 'DEL' },
                { id: 'portal', icon: <DoorOpen size={14}/>, label: 'DOR' },
                { id: 'spawn', icon: <UserCircle size={14}/>, label: 'SPW' },
                { id: 'border', icon: <Globe size={14}/>, label: 'BDR' }
              ].map(t => (
                <button key={t.id} onClick={() => setActiveTool(t.id as any)} className={`p-2 rounded-xl flex flex-col items-center gap-1 transition-all ${activeTool === t.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}>
                  {t.icon} <span className="text-[7px] font-black uppercase">{t.label}</span>
                </button>
              ))}
           </section>

           <section className="space-y-3 bg-zinc-900/20 p-4 rounded-xl border border-zinc-800/50">
              <div className="flex items-center justify-between"><h2 className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Harita Boyutu</h2><Box size={12} className="text-zinc-700"/></div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="flex flex-col gap-1">
                    <span className="text-[8px] text-zinc-600 font-bold uppercase">Genişlik</span>
                    <input type="number" value={mapConfig.tilesW} onChange={e => setMapConfig({...mapConfig, tilesW: Math.max(1, parseInt(e.target.value) || 1)})} className="w-full bg-black/40 rounded-lg border border-zinc-800 p-2 text-xs font-bold text-white outline-none focus:border-indigo-500"/>
                 </div>
                 <div className="flex flex-col gap-1">
                    <span className="text-[8px] text-zinc-600 font-bold uppercase">Yükseklik</span>
                    <input type="number" value={mapConfig.tilesH} onChange={e => setMapConfig({...mapConfig, tilesH: Math.max(1, parseInt(e.target.value) || 1)})} className="w-full bg-black/40 rounded-lg border border-zinc-800 p-2 text-xs font-bold text-white outline-none focus:border-indigo-500"/>
                 </div>
              </div>
           </section>

           {activeTool === 'portal' && selectedPortal && (
             <section className="space-y-4 bg-indigo-500/5 p-4 rounded-xl border border-indigo-500/20">
                <div className="flex flex-col gap-2">
                   {portals.map(p => (
                     <button key={p.id} onClick={() => setPortalTarget(p.target)} className={`text-[10px] font-bold p-2.5 rounded-lg border transition-all ${portalTarget === p.target ? 'bg-indigo-500 text-white border-indigo-400 shadow-md' : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:border-zinc-700'}`}>{p.name}</button>
                   ))}
                </div>
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="space-y-1">
                    <span className="text-[8px] text-zinc-600 font-bold ml-1 uppercase tracking-tighter">Genişlik (Tile)</span>
                    <div className="flex items-center bg-black rounded-lg border border-zinc-800 overflow-hidden"><button onClick={() => setPortals(prev => prev.map(p => p.target === portalTarget ? {...p, tw: Math.max(1, p.tw-1)} : p))} className="p-1.5"><Minus size={10}/></button><input readOnly value={selectedPortal.tw} className="w-full bg-transparent text-center text-xs font-bold"/><button onClick={() => setPortals(prev => prev.map(p => p.target === portalTarget ? {...p, tw: p.tw+1} : p))} className="p-1.5"><Plus size={10}/></button></div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[8px] text-zinc-600 font-bold ml-1 uppercase tracking-tighter">Yükseklik (Tile)</span>
                    <div className="flex items-center bg-black rounded-lg border border-zinc-800 overflow-hidden"><button onClick={() => setPortals(prev => prev.map(p => p.target === portalTarget ? {...p, th: Math.max(1, p.th-1)} : p))} className="p-1.5"><Minus size={10}/></button><input readOnly value={selectedPortal.th} className="w-full bg-transparent text-center text-xs font-bold"/><button onClick={() => setPortals(prev => prev.map(p => p.target === portalTarget ? {...p, th: p.th+1} : p))} className="p-1.5"><Plus size={10}/></button></div>
                  </div>
                </div>
             </section>
           )}

           <section className="space-y-4">
              <div className="flex items-center justify-between"><h2 className="text-[9px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2"><ImageIcon size={12}/> Kütüphane ({assets.length})</h2><input type="file" ref={fileInputRef} onChange={handleCustomUpload} className="hidden" accept="image/png"/><button onClick={() => fileInputRef.current?.click()} className="p-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-400 hover:text-white transition-all"><UploadCloud size={14}/></button></div>
              <div className="grid grid-cols-3 gap-2">
                 {assets.map(asset => (
                   <div key={asset.id} className="relative group/card" onContextMenu={(e) => { e.preventDefault(); handleRandomDistribute(asset); }}>
                     <button onClick={() => { if(activeTool === 'border') setMapConfig({...mapConfig, borderAssetId: asset.id}); else setSelectedAsset(asset); }} className={`w-full aspect-square rounded-xl border-2 transition-all flex items-center justify-center p-1 overflow-hidden ${selectedAsset?.id === asset.id || (activeTool === 'border' && mapConfig.borderAssetId === asset.id) ? 'border-indigo-500 bg-indigo-500/10 shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'}`}>
                        <img src={asset.isCustom ? asset.source : `/assets/sprout-lands/${asset.source}`} className="max-w-none origin-center" style={{ objectFit: 'none', objectPosition: `-${asset.x}px -${asset.y}px`, width: `${asset.w}px`, height: `${asset.h}px`, transform: `scale(${Math.min(1.5, 32/Math.max(asset.w, asset.h))})`, imageRendering: 'pixelated' }} />
                     </button>
                     <div className="absolute inset-0 bg-black/80 opacity-0 group-hover/card:opacity-100 transition-opacity flex flex-col items-center justify-center pointer-events-none rounded-xl">
                        <span className="text-[6px] font-bold text-white text-center leading-tight mb-1 uppercase">{asset.name}</span>
                        <div className="flex gap-1">
                          <button onClick={(e) => { e.stopPropagation(); handleRandomDistribute(asset); }} className="p-1 bg-indigo-600 rounded-md pointer-events-auto hover:bg-indigo-500" title="Rastgele Dağıt"><Hash size={8}/></button>
                          <button onClick={(e) => { e.stopPropagation(); adjustAssetScale(asset.id); }} className="p-1 bg-green-600 rounded-md pointer-events-auto hover:bg-green-500" title="Boyut Ayarla"><Maximize size={8}/></button>
                          <button onClick={(e) => { e.stopPropagation(); setAssets(prev => prev.filter(a => a.id !== asset.id)); }} className="p-1 bg-red-600 rounded-md pointer-events-auto hover:bg-red-500" title="Sil"><Trash2 size={8}/></button>
                        </div>
                     </div>
                   </div>
                 ))}
                 <button onClick={() => setShowCropper(true)} className="aspect-square rounded-xl border-2 border-dashed border-zinc-800 hover:border-indigo-500 text-zinc-600 flex items-center justify-center transition-all bg-zinc-900/20"><Plus size={18}/></button>
              </div>
           </section>
        </div>

        <div className="p-6 border-t border-zinc-800 bg-[#0c0c0f]">
           <button onClick={exportJson} className="w-full flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 rounded-2xl transition-all shadow-2xl active:scale-95 uppercase tracking-[0.1em] text-xs">DIŞA AKTAR (JSON)</button>
        </div>
      </aside>

      <main className="flex-1 relative bg-[#111114] overflow-auto scrollbar-hide cursor-crosshair h-full" onMouseUp={() => { setIsMouseDown(false); lastPlacedTile.current = null; }}>
        <div className="p-96 min-w-max min-h-max relative">
          {borderAsset && (
             <div className="absolute inset-0 pointer-events-none opacity-100 z-0" 
                  style={{ 
                     backgroundImage: `url(${borderAsset.isCustom ? borderAsset.source : `/assets/sprout-lands/${borderAsset.source}`})`,
                     backgroundPosition: `-${borderAsset.x * SCALE}px -${borderAsset.y * SCALE}px`,
                     backgroundSize: `${borderAsset.w * SCALE}px ${borderAsset.h * SCALE}px`,
                     imageRendering: 'pixelated',
                     width: '100%', height: '100%'
                  }} />
          )}

          <div 
             onMouseDown={(e) => { setIsMouseDown(true); handleMapInteraction(e); }}
             onMouseMove={(e) => { if(isMouseDown) handleMapInteraction(e); }}
             onContextMenu={(e) => e.preventDefault()}
             ref={mapContentRef}
             className="relative shadow-[0_0_150px_rgba(0,0,0,1)] border-4 border-black/40 z-10 overflow-hidden hardware-accelerated" 
             style={{ 
               width: mapConfig.tilesW * DISPLAY_TILE, 
               height: mapConfig.tilesH * DISPLAY_TILE,
               backgroundColor: borderAsset ? 'transparent' : '#5e9d34'
             }}
          >
             <div className="absolute inset-0 pointer-events-none opacity-10" 
                  style={{ backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`, backgroundSize: `${DISPLAY_TILE}px ${DISPLAY_TILE}px` }} />

             {placedObjects.map(obj => {
               const asset = assets.find(a => a.id === obj.assetId);
               if (!asset) return null;
               const currentScale = obj.scale || SCALE;
               const depth = obj.isAbovePlayer ? 1000 : (asset.name.toLowerCase().includes('grass') ? -1 : obj.ty);

               // Manuel yüklenen görseller için gerçek boyut kullan, diğerleri için transform scale
               const isCustom = asset.isCustom;
               const finalWidth = isCustom ? asset.w * currentScale : asset.w * currentScale;
               const finalHeight = isCustom ? asset.h * currentScale : asset.h * currentScale;
               const imgStyle = isCustom 
                 ? { width: `${finalWidth}px`, height: `${finalHeight}px`, imageRendering: 'pixelated', display: 'block' }
                 : { objectFit: 'none', objectPosition: `-${asset.x}px -${asset.y}px`, width: `${asset.w}px`, height: `${asset.h}px`, transform: `scale(${currentScale})`, imageRendering: 'pixelated' };

               return (
                 <div 
                   key={obj.id} 
                   className="absolute group/obj" 
                   style={{ left: obj.tx * DISPLAY_TILE, top: obj.ty * DISPLAY_TILE, width: finalWidth, height: finalHeight, zIndex: depth, overflow: 'hidden' }}
                 >
                   <img src={asset.isCustom ? asset.source : `/assets/sprout-lands/${asset.source}`} className={isCustom ? "pointer-events-none" : "origin-top-left pointer-events-none"} style={imgStyle} />
                   
                   <div className="absolute -top-6 left-0 right-0 flex justify-center gap-1 opacity-0 group-hover/obj:opacity-100 transition-opacity z-[2000]">
                      <button onClick={(e) => { e.stopPropagation(); toggleLayer(obj.id); }} className="p-1 bg-zinc-800 text-white rounded-md shadow-lg border border-white/10 hover:bg-zinc-700" title="Katman Değiştir"><Layers size={10}/></button>
                      <button onClick={(e) => { e.stopPropagation(); adjustScale(obj.id); }} className="p-1 bg-zinc-800 text-white rounded-md shadow-lg border border-white/10 hover:bg-zinc-700" title="Boyut Ayarla"><Maximize size={10}/></button>
                      <button onClick={(e) => { e.stopPropagation(); setPlacedObjects(prev => prev.filter(o => o.id !== obj.id)); }} className="p-1 bg-red-600 text-white rounded-md shadow-lg border border-white/10 hover:bg-red-500" title="Sil"><Trash2 size={10}/></button>
                   </div>
                 </div>
               );
             })}

             {collisions.map(c => (
               <div key={c.id} className="absolute bg-red-500/40 border border-red-500/60 z-50 flex items-center justify-center pointer-events-none" style={{ left: c.tx * DISPLAY_TILE, top: c.ty * DISPLAY_TILE, width: DISPLAY_TILE, height: DISPLAY_TILE }}><Ban size={10} className="text-white opacity-40" /></div>
             ))}

             {portals.map(p => (
               <div key={p.id} className="absolute z-[100]" style={{ left: p.tx * DISPLAY_TILE, top: p.ty * DISPLAY_TILE, width: p.tw * DISPLAY_TILE, height: p.th * DISPLAY_TILE }}>
                  <div className="absolute inset-0 rounded-xl bg-black/60 backdrop-blur-sm border-2 flex flex-col items-center justify-center shadow-xl border-white/40" style={{ backgroundColor: `${p.color}66` }}>
                     <DoorOpen size={18} style={{ color: 'white' }} />
                  </div>
               </div>
             ))}

             <div className="absolute z-[200] pointer-events-none" style={{ left: mapConfig.spawnTX * DISPLAY_TILE, top: mapConfig.spawnTY * DISPLAY_TILE, width: DISPLAY_TILE, height: DISPLAY_TILE }}>
                <div className="w-full h-full flex flex-col items-center justify-center gap-1 scale-75">
                  <UserCircle size={24} className="text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.5)] animate-bounce" />
                </div>
             </div>

             {fillStart && ctrlPressed && (
               <div className="absolute border-4 border-indigo-400 bg-indigo-500/20 z-[300] pointer-events-none" 
                    style={{ 
                      left: Math.min(fillStart.tx, Math.floor(parseInt(document.documentElement.style.getPropertyValue('--cur-tx')) || 0)) * DISPLAY_TILE,
                      top: Math.min(fillStart.ty, Math.floor(parseInt(document.documentElement.style.getPropertyValue('--cur-ty')) || 0)) * DISPLAY_TILE,
                      width: (Math.abs(fillStart.tx - (Math.floor(parseInt(document.documentElement.style.getPropertyValue('--cur-tx')) || 0))) + 1) * DISPLAY_TILE,
                      height: (Math.abs(fillStart.ty - (Math.floor(parseInt(document.documentElement.style.getPropertyValue('--cur-ty')) || 0))) + 1) * DISPLAY_TILE
                    }} />
             )}
          </div>
        </div>
      </main>

      {selectedAsset && activeTool === 'place' && !showCropper && (
        <div className="fixed pointer-events-none z-50 transition-none" style={{ left: 0, top: 0, transform: `translate(var(--mouse-x), var(--mouse-y))` }}>
           {(() => {
             const assetScale = selectedAsset.scale || 1;
             const finalScale = SCALE * assetScale;
             const isCustom = selectedAsset.isCustom;
             const finalWidth = selectedAsset.w * finalScale;
             const finalHeight = selectedAsset.h * finalScale;
             const imgStyle = isCustom
               ? { width: `${finalWidth}px`, height: `${finalHeight}px`, imageRendering: 'pixelated', display: 'block' }
               : { objectFit: 'none', objectPosition: `-${selectedAsset.x}px -${selectedAsset.y}px`, width: `${selectedAsset.w}px`, height: `${selectedAsset.h}px`, transform: `scale(${finalScale})`, imageRendering: 'pixelated' };
             return (
               <div className="relative -left-[24px] -top-[24px] opacity-40 border-2 border-indigo-400 bg-indigo-500/10 overflow-hidden" style={{ width: finalWidth, height: finalHeight }}>
                  <img src={selectedAsset.isCustom ? selectedAsset.source : `/assets/sprout-lands/${selectedAsset.source}`} className={isCustom ? "" : "origin-top-left"} style={imgStyle} />
               </div>
             );
           })()}
        </div>
      )}

      <AnimatePresence>
        {showCropper && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col p-4 md:p-8 overflow-hidden">
            <div className="bg-[#111114] border border-zinc-800 rounded-3xl flex flex-col h-full shadow-2xl overflow-hidden max-w-7xl mx-auto w-full">
               <div className="p-5 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-5 bg-zinc-900/50">
                  <div className="flex items-center gap-4"><div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400"><Scissors size={20} /></div><h2 className="text-base font-bold text-white uppercase tracking-tight italic">Asset Creator</h2></div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-zinc-800/50 p-1.5 rounded-xl border border-zinc-800">
                       <FolderOpen size={14} className="text-zinc-500 ml-1" />
                       <select value={cropSource} onChange={(e) => setCropSource(e.target.value)} className="bg-transparent text-[11px] font-bold text-white focus:outline-none pr-4 min-w-[220px] cursor-pointer">
                         {sourceFiles.map(f => <option key={f} value={f} className="bg-[#1a1a1c]">{f}</option>)}
                       </select>
                    </div>
                    <button onClick={() => { const name = prompt("Asset Adı:"); if(name) { setAssets([...assets, { id: `c_${Date.now()}`, source: cropSource, ...currentSelection, name }]); setShowCropper(false); }}} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg active:scale-95 uppercase tracking-widest">KAYDET</button>
                    <button onClick={() => setShowCropper(false)} className="p-2.5 hover:bg-zinc-800 rounded-xl text-zinc-500 hover:text-white transition-all"><X size={20} /></button>
                  </div>
               </div>
               <div className="flex-1 overflow-auto bg-black/50 p-8 cursor-crosshair flex justify-center items-start">
                  <div className="relative inline-block border border-zinc-800 shadow-2xl">
                     <img ref={cropperImageRef} src={`/assets/sprout-lands/${cropSource}`} className="max-w-none origin-top-left" style={{ imageRendering: 'pixelated', transform: 'scale(2)' }} onMouseDown={handleCropperMouseDown} onMouseMove={handleCropperMouseMove} onMouseUp={() => setIsSelecting(false)} draggable={false} />
                     <div className="absolute border-2 border-indigo-400 bg-indigo-400/20 z-10 pointer-events-none shadow-[0_0_20px_rgba(129,140,248,0.3)]" style={{ left: currentSelection.x * 2, top: currentSelection.y * 2, width: currentSelection.w * 2, height: currentSelection.h * 2 }}>
                        <span className="absolute -top-7 left-0 bg-indigo-600 text-white text-[9px] px-2 py-0.5 rounded-full font-black whitespace-nowrap">{currentSelection.w}x{currentSelection.h} PX</span>
                     </div>
                     <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
                  </div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
