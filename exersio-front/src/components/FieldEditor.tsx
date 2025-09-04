import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { FieldData, Point, Arrow, Annotation } from '../types';
import { 
  MousePointer, 
  Move3D, 
  Type, 
  Trash2, 
  RotateCcw, 
  Download,
  Palette,
  Undo2,
  Redo2,
  Users,
  Target,
  ArrowRight,
  FileText,
  Copy,
  Grid3X3,
  Zap
} from 'lucide-react';

interface FieldEditorProps {
  fieldData: FieldData;
  onChange: (fieldData: FieldData) => void;
  fieldType?: 'volleyball' | 'basketball' | 'football' | 'tennis';
  onClose?: () => void;
}

type Tool = 'select' | 'player' | 'ball' | 'arrow' | 'annotation' | 'zone';
type PlayerType = 'player' | 'opponent' | 'coach';

interface HistoryState {
  fieldData: FieldData;
  timestamp: number;
}

export function FieldEditor({ fieldData, onChange, fieldType = 'volleyball', onClose }: FieldEditorProps) {
  const [currentTool, setCurrentTool] = useState<Tool>('select');
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState('#00d4aa');
  const [playerType, setPlayerType] = useState<PlayerType>('player');
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [history, setHistory] = useState<HistoryState[]>([{ fieldData, timestamp: Date.now() }]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [showGrid, setShowGrid] = useState(true);
  // État pour la prévisualisation en temps réel
  const [previewPos, setPreviewPos] = useState<{ x: number; y: number } | null>(null);
  
  const svgRef = useRef<SVGSVGElement>(null);

  const colors = [
    '#00d4aa', // Exersio teal
    '#ff4757', // Red
    '#3742fa', // Blue  
    '#ffa502', // Orange
    '#2ed573', // Green
    '#ff6b7a', // Pink
    '#ffffff', // White
    '#000000'  // Black
  ];

  const playerColors = {
    player: '#00d4aa',
    opponent: '#ff4757',
    coach: '#ffa502'
  };

  // Save state to history
  const saveToHistory = useCallback((newFieldData: FieldData) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ fieldData: newFieldData, timestamp: Date.now() });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    onChange(newFieldData);
  }, [history, historyIndex, onChange]);

  // Undo/Redo functions
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      onChange(history[newIndex].fieldData);
    }
  }, [historyIndex, history, onChange]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      onChange(history[newIndex].fieldData);
    }
  }, [historyIndex, history, onChange]);

  const getCoordinatesFromEvent = useCallback((event: React.MouseEvent) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    
    const rect = svg.getBoundingClientRect();
    
    // Obtenir les coordonnées réelles dans le viewBox du SVG
    const svgPoint = svg.createSVGPoint();
    svgPoint.x = event.clientX;
    svgPoint.y = event.clientY;
    
    // Transformer les coordonnées écran en coordonnées SVG
    const transformedPoint = svgPoint.matrixTransform(svg.getScreenCTM()?.inverse());
    
    return { 
      x: Math.max(0, Math.min(400, transformedPoint.x)), 
      y: Math.max(0, Math.min(200, transformedPoint.y)) 
    };
  }, []);

  const findElementAt = useCallback((x: number, y: number) => {
    // Check points first (smallest targets)
    for (const point of fieldData.points) {
      const distance = Math.sqrt((point.x - x) ** 2 + (point.y - y) ** 2);
      if (distance <= point.size + 5) {
        return { type: 'point', element: point };
      }
    }
    
    // Check annotations
    for (const annotation of fieldData.annotations) {
      if (Math.abs(annotation.x - x) <= 30 && Math.abs(annotation.y - y) <= 10) {
        return { type: 'annotation', element: annotation };
      }
    }
    
    return null;
  }, [fieldData]);

  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    const coords = getCoordinatesFromEvent(event);
    
    if (currentTool === 'select') {
      const found = findElementAt(coords.x, coords.y);
      if (found) {
        setSelectedElement(found.element.id);
        setIsDragging(true);
        setDragOffset({
          x: coords.x - found.element.x,
          y: coords.y - found.element.y
        });
      } else {
        setSelectedElement(null);
      }
    } else if (currentTool === 'player' || currentTool === 'ball') {
      const pointType = currentTool === 'player' ? playerType : 'ball';
      const newPoint: Point = {
        id: `${pointType}_${Date.now()}`,
        x: coords.x,
        y: coords.y,
        color: currentTool === 'ball' ? '#ffa502' : playerColors[playerType],
        size: currentTool === 'ball' ? 6 : 10,
        type: pointType,
      };
      
      const newFieldData = {
        ...fieldData,
        points: [...fieldData.points, newPoint],
      };
      saveToHistory(newFieldData);
    } else if (currentTool === 'arrow') {
      setIsDrawing(true);
      setStartPoint(coords);
    } else if (currentTool === 'annotation') {
      const text = prompt('Entrez le texte de l\'annotation:');
      if (text) {
        const newAnnotation: Annotation = {
          id: `annotation_${Date.now()}`,
          x: coords.x,
          y: coords.y,
          text,
          fontSize: 14,
          color: selectedColor,
        };
        
        const newFieldData = {
          ...fieldData,
          annotations: [...fieldData.annotations, newAnnotation],
        };
        saveToHistory(newFieldData);
      }
    } else if (currentTool === 'zone') {
      setIsDrawing(true);
      setStartPoint(coords);
    }
  }, [currentTool, selectedColor, fieldData, saveToHistory, getCoordinatesFromEvent, findElementAt, playerType, playerColors]);

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    const coords = getCoordinatesFromEvent(event);
    
    // Mise à jour en temps réel de la prévisualisation des flèches
    if (currentTool === 'arrow' && isDrawing && startPoint) {
      setPreviewPos(coords);
      return; // Éviter les autres traitements pendant le dessin
    }
    
    // Prévisualisation pour les zones
    if (currentTool === 'zone' && isDrawing && startPoint) {
      setPreviewPos(coords);
      return;
    }
    
    if (isDragging && selectedElement) {
      const newX = coords.x - dragOffset.x;
      const newY = coords.y - dragOffset.y;
      
      const newFieldData = { ...fieldData };
      
      // Update point position
      const pointIndex = newFieldData.points.findIndex(p => p.id === selectedElement);
      if (pointIndex !== -1) {
        newFieldData.points[pointIndex] = {
          ...newFieldData.points[pointIndex],
          x: Math.max(10, Math.min(390, newX)),
          y: Math.max(10, Math.min(190, newY))
        };
        onChange(newFieldData);
      }
      
      // Update annotation position
      const annotationIndex = newFieldData.annotations.findIndex(a => a.id === selectedElement);
      if (annotationIndex !== -1) {
        newFieldData.annotations[annotationIndex] = {
          ...newFieldData.annotations[annotationIndex],
          x: Math.max(10, Math.min(390, newX)),
          y: Math.max(10, Math.min(190, newY))
        };
        onChange(newFieldData);
      }
    }
  }, [isDragging, selectedElement, dragOffset, fieldData, onChange, getCoordinatesFromEvent, currentTool, isDrawing, startPoint]);

  const handleMouseUp = useCallback((event: React.MouseEvent) => {
    if (currentTool === 'arrow' && isDrawing && startPoint) {
      const endCoords = getCoordinatesFromEvent(event);
      
      // Ensure minimum arrow length
      const distance = Math.sqrt((endCoords.x - startPoint.x) ** 2 + (endCoords.y - startPoint.y) ** 2);
      if (distance > 10) {
        const newArrow: Arrow = {
          id: `arrow_${Date.now()}`,
          startX: startPoint.x,
          startY: startPoint.y,
          endX: endCoords.x,
          endY: endCoords.y,
          color: selectedColor,
          width: 3,
          style: 'solid',
        };
        
        const newFieldData = {
          ...fieldData,
          arrows: [...fieldData.arrows, newArrow],
        };
        saveToHistory(newFieldData);
      }
      
      setIsDrawing(false);
      setStartPoint(null);
      setPreviewPos(null);
    } else if (currentTool === 'zone' && isDrawing && startPoint) {
      const endCoords = getCoordinatesFromEvent(event);
      
      // Create a zone as a rectangle annotation
      const width = Math.abs(endCoords.x - startPoint.x);
      const height = Math.abs(endCoords.y - startPoint.y);
      
      if (width > 20 && height > 20) {
        const newAnnotation: Annotation = {
          id: `zone_${Date.now()}`,
          x: Math.min(startPoint.x, endCoords.x),
          y: Math.min(startPoint.y, endCoords.y),
          text: 'Zone',
          fontSize: 12,
          color: selectedColor,
          width,
          height,
          type: 'zone'
        };
        
        const newFieldData = {
          ...fieldData,
          annotations: [...fieldData.annotations, newAnnotation],
        };
        saveToHistory(newFieldData);
      }
      
      setIsDrawing(false);
      setStartPoint(null);
      setPreviewPos(null);
    }
    
    if (isDragging) {
      setIsDragging(false);
      saveToHistory(fieldData);
    }
  }, [currentTool, isDrawing, startPoint, selectedColor, fieldData, saveToHistory, getCoordinatesFromEvent, isDragging]);

  const deleteElement = useCallback((elementId: string, type: 'point' | 'arrow' | 'annotation') => {
    let newFieldData = { ...fieldData };
    
    if (type === 'point') {
      newFieldData.points = fieldData.points.filter(p => p.id !== elementId);
    } else if (type === 'arrow') {
      newFieldData.arrows = fieldData.arrows.filter(a => a.id !== elementId);
    } else if (type === 'annotation') {
      newFieldData.annotations = fieldData.annotations.filter(a => a.id !== elementId);
    }
    
    saveToHistory(newFieldData);
    setSelectedElement(null);
  }, [fieldData, saveToHistory]);

  const clearField = useCallback(() => {
    const newFieldData = {
      ...fieldData,
      points: [],
      arrows: [],
      annotations: [],
    };
    saveToHistory(newFieldData);
    setSelectedElement(null);
  }, [fieldData, saveToHistory]);

  const duplicateElement = useCallback(() => {
    if (!selectedElement) return;
    
    let newFieldData = { ...fieldData };
    
    // Find and duplicate the selected element
    const point = fieldData.points.find(p => p.id === selectedElement);
    if (point) {
      const newPoint = {
        ...point,
        id: `${point.type || 'point'}_${Date.now()}`,
        x: point.x + 20,
        y: point.y + 20
      };
      newFieldData.points = [...fieldData.points, newPoint];
    }
    
    const annotation = fieldData.annotations.find(a => a.id === selectedElement);
    if (annotation) {
      const newAnnotation = {
        ...annotation,
        id: `annotation_${Date.now()}`,
        x: annotation.x + 20,
        y: annotation.y + 20
      };
      newFieldData.annotations = [...fieldData.annotations, newAnnotation];
    }
    
    saveToHistory(newFieldData);
  }, [selectedElement, fieldData, saveToHistory]);

  // Load exercise templates
  const loadTemplate = useCallback((templateName: string) => {
    let templateData: Partial<FieldData> = {};
    
    switch (templateName) {
      case 'reception':
        templateData = {
          points: [
            { id: 'p1', x: 75, y: 160, color: playerColors.player, size: 10, type: 'player' },
            { id: 'p2', x: 125, y: 160, color: playerColors.player, size: 10, type: 'player' },
            { id: 'p3', x: 175, y: 160, color: playerColors.player, size: 10, type: 'player' },
            { id: 'p4', x: 275, y: 160, color: playerColors.player, size: 10, type: 'player' },
            { id: 'p5', x: 325, y: 160, color: playerColors.player, size: 10, type: 'player' },
            { id: 'p6', x: 200, y: 140, color: playerColors.player, size: 10, type: 'player' },
            { id: 'ball', x: 100, y: 50, color: '#ffa502', size: 6, type: 'ball' }
          ],
          arrows: [
            { id: 'a1', startX: 100, startY: 50, endX: 125, endY: 160, color: '#00d4aa', width: 3, style: 'solid' }
          ],
          annotations: [
            { id: 'ann1', x: 50, y: 20, text: 'Service adverse', fontSize: 12, color: '#ff4757' },
            { id: 'ann2', x: 250, y: 180, text: 'Réception', fontSize: 12, color: '#00d4aa' }
          ]
        };
        break;
      case 'attaque':
        templateData = {
          points: [
            { id: 'p1', x: 75, y: 140, color: playerColors.player, size: 10, type: 'player' },
            { id: 'p2', x: 175, y: 120, color: playerColors.player, size: 10, type: 'player' },
            { id: 'p3', x: 150, y: 60, color: playerColors.player, size: 10, type: 'player' },
            { id: 'p4', x: 275, y: 60, color: playerColors.player, size: 10, type: 'player' },
            { id: 'ball', x: 175, y: 120, color: '#ffa502', size: 6, type: 'ball' }
          ],
          arrows: [
            { id: 'a1', startX: 175, startY: 120, endX: 150, endY: 60, color: '#00d4aa', width: 3, style: 'solid' },
            { id: 'a2', startX: 175, startY: 120, endX: 275, endY: 60, color: '#3742fa', width: 3, style: 'dashed' }
          ]
        };
        break;
    }
    
    const newFieldData = {
      ...fieldData,
      ...templateData
    };
    saveToHistory(newFieldData);
  }, [fieldData, saveToHistory, playerColors]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' && !e.shiftKey) {
          e.preventDefault();
          undo();
        } else if (e.key === 'z' && e.shiftKey || e.key === 'y') {
          e.preventDefault();
          redo();
        } else if (e.key === 'd') {
          e.preventDefault();
          duplicateElement();
        }
      } else if (e.key === 'Delete' && selectedElement) {
        e.preventDefault();
        const elementType = selectedElement.startsWith('point') || selectedElement.includes('player') || selectedElement.includes('ball') ? 'point' :
                         selectedElement.startsWith('arrow') ? 'arrow' : 'annotation';
        deleteElement(selectedElement, elementType);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, duplicateElement, selectedElement, deleteElement]);

  const renderGrid = () => {
    if (!showGrid) return null;
    
    const lines = [];
    for (let x = 0; x <= 400; x += 20) {
      lines.push(
        <line
          key={`v${x}`}
          x1={x}
          y1={0}
          x2={x}
          y2={200}
          stroke="#3d4a5c"
          strokeWidth="0.5"
          opacity="0.3"
        />
      );
    }
    for (let y = 0; y <= 200; y += 20) {
      lines.push(
        <line
          key={`h${y}`}
          x1={0}
          y1={y}
          x2={400}
          y2={y}
          stroke="#3d4a5c"
          strokeWidth="0.5"
          opacity="0.3"
        />
      );
    }
    return <g>{lines}</g>;
  };

  const renderVolleyballField = () => (
    <g>
      {/* Background */}
      <rect x="0" y="0" width="400" height="200" fill="#f0f9ff" />
      
      {/* Terrain principal */}
      <rect x="50" y="25" width="300" height="150" fill="#fef3c7" stroke="#00d4aa" strokeWidth="3" />
      
      {/* Ligne centrale */}
      <line x1="200" y1="25" x2="200" y2="175" stroke="#00d4aa" strokeWidth="3" />
      
      {/* Zones d'attaque */}
      <line x1="110" y1="25" x2="110" y2="175" stroke="#00d4aa" strokeWidth="2" strokeDasharray="8,4" />
      <line x1="290" y1="25" x2="290" y2="175" stroke="#00d4aa" strokeWidth="2" strokeDasharray="8,4" />
      
      {/* Filet */}
      <rect x="198" y="15" width="4" height="170" fill="#00d4aa" />
      <line x1="198" y1="15" x2="202" y2="15" stroke="#00d4aa" strokeWidth="2" />
      <line x1="198" y1="185" x2="202" y2="185" stroke="#00d4aa" strokeWidth="2" />
      
      {/* Postes avec cercles */}
      <g stroke="#666" fill="white" strokeWidth="1">
        <circle cx="75" cy="45" r="8" />
        <circle cx="125" cy="45" r="8" />
        <circle cx="175" cy="45" r="8" />
        <circle cx="225" cy="45" r="8" />
        <circle cx="275" cy="45" r="8" />
        <circle cx="325" cy="45" r="8" />
      </g>
      
      {/* Numéros des postes */}
      <g fontSize="10" fill="#666" textAnchor="middle">
        <text x="75" y="49">1</text>
        <text x="125" y="49">2</text>
        <text x="175" y="49">3</text>
        <text x="225" y="49">4</text>
        <text x="275" y="49">5</text>
        <text x="325" y="49">6</text>
      </g>
      
      {/* Labels des zones */}
      <g fontSize="12" fill="#00d4aa" textAnchor="middle" fontWeight="500">
        <text x="130" y="200">Zone d'attaque</text>
        <text x="270" y="200">Zone d'attaque</text>
        <text x="200" y="10">FILET</text>
      </g>
    </g>
  );

  const renderPreviewArrow = () => {
    if (currentTool === 'arrow' && isDrawing && startPoint && previewPos) {
      // Calculer la distance pour s'assurer qu'on affiche la flèche seulement si elle a une longueur minimale
      const distance = Math.sqrt((previewPos.x - startPoint.x) ** 2 + (previewPos.y - startPoint.y) ** 2);
      
      if (distance > 5) { // Longueur minimale pour éviter les flèches trop courtes
        return (
          <g opacity="0.7">
            <defs>
              <marker
                id="preview-arrowhead"
                markerWidth="12"
                markerHeight="8"
                refX="12"
                refY="4"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <polygon points="0 0, 12 4, 0 8" fill={selectedColor} />
              </marker>
            </defs>
            <line
              x1={startPoint.x}
              y1={startPoint.y}
              x2={previewPos.x}
              y2={previewPos.y}
              stroke={selectedColor}
              strokeWidth="3"
              strokeDasharray="6,3"
              markerEnd="url(#preview-arrowhead)"
              filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
            />
            {/* Cercle au point de départ pour feedback visuel */}
            <circle
              cx={startPoint.x}
              cy={startPoint.y}
              r="4"
              fill={selectedColor}
              opacity="0.8"
            />
          </g>
        );
      }
    }
    
    // Prévisualisation pour les zones
    if (currentTool === 'zone' && isDrawing && startPoint && previewPos) {
      const width = Math.abs(previewPos.x - startPoint.x);
      const height = Math.abs(previewPos.y - startPoint.y);
      
      if (width > 10 && height > 10) {
        return (
          <g opacity="0.5">
            <rect
              x={Math.min(startPoint.x, previewPos.x)}
              y={Math.min(startPoint.y, previewPos.y)}
              width={width}
              height={height}
              fill={selectedColor}
              fillOpacity="0.2"
              stroke={selectedColor}
              strokeWidth="2"
              strokeDasharray="5,5"
            />
          </g>
        );
      }
    }
    
    return null;
  };

  // Fonction pour créer des flèches numérotées
  const createNumberedArrow = useCallback((startX: number, startY: number, endX: number, endY: number, stepNumber: number) => {
    const newArrow: Arrow = {
      id: `arrow_step_${stepNumber}_${Date.now()}`,
      startX,
      startY,
      endX,
      endY,
      color: selectedColor,
      width: 3,
      style: 'solid',
    };
    
    // Ajouter également une annotation avec le numéro
    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2;
    const newAnnotation: Annotation = {
      id: `step_${stepNumber}_${Date.now()}`,
      x: midX,
      y: midY - 10,
      text: stepNumber.toString(),
      fontSize: 14,
      color: '#ffffff',
      type: 'text'
    };
    
    const newFieldData = {
      ...fieldData,
      arrows: [...fieldData.arrows, newArrow],
      annotations: [...fieldData.annotations, newAnnotation],
    };
    
    saveToHistory(newFieldData);
  }, [fieldData, selectedColor, saveToHistory]);

  const tools = [
    { id: 'select' as Tool, label: 'Sélection', icon: MousePointer, tooltip: 'Sélectionner et déplacer (S)' },
    { id: 'player' as Tool, label: 'Joueur', icon: Users, tooltip: 'Placer un joueur (P)' },
    { id: 'ball' as Tool, label: 'Ballon', icon: Target, tooltip: 'Placer le ballon (B)' },
    { id: 'arrow' as Tool, label: 'Flèche', icon: ArrowRight, tooltip: 'Dessiner une trajectoire (A)' },
    { id: 'annotation' as Tool, label: 'Texte', icon: FileText, tooltip: 'Ajouter du texte (T)' },
    { id: 'zone' as Tool, label: 'Zone', icon: Grid3X3, tooltip: 'Délimiter une zone (Z)' },
  ];

  return (
    <TooltipProvider>
      <Card className="w-full exersio-card">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#00d4aa] to-[#00b894] flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">Éditeur de terrain avancé</CardTitle>
                <p className="text-sm text-[#a1a8b0] mt-1">
                  Créez des schémas tactiques interactifs
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={undo}
                disabled={historyIndex <= 0}
                className="gap-2"
              >
                <Undo2 className="w-4 h-4" />
                Annuler
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={redo}
                disabled={historyIndex >= history.length - 1}
                className="gap-2"
              >
                <Redo2 className="w-4 h-4" />
                Refaire
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <Button size="sm" variant="outline" onClick={clearField} className="gap-2">
                <RotateCcw className="w-4 h-4" />
                Effacer
              </Button>
              <Button size="sm" variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Export
              </Button>
              {onClose && (
                <Button size="sm" variant="ghost" onClick={onClose}>
                  ✕
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Barre d'outils principale */}
          <div className="flex items-center gap-4 flex-wrap p-6 bg-[#1e2731] rounded-xl border border-[#3d4a5c]">
            {/* Outils */}
            <div className="flex items-center gap-2">
              {tools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <Tooltip key={tool.id}>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant={currentTool === tool.id ? "default" : "outline"}
                        onClick={() => setCurrentTool(tool.id)}
                        className={`gap-2 ${currentTool === tool.id ? 'bg-[#00d4aa] hover:bg-[#00b894]' : ''}`}
                      >
                        <Icon className="w-4 h-4" />
                        {tool.label}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{tool.tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
            
            <Separator orientation="vertical" className="h-8" />
            
            {/* Type de joueur (si outil joueur sélectionné) */}
            {currentTool === 'player' && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#a1a8b0]">Type:</span>
                <Select value={playerType} onValueChange={(value: PlayerType) => setPlayerType(value)}>
                  <SelectTrigger className="w-32 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="player">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#00d4aa]" />
                        Joueur
                      </div>
                    </SelectItem>
                    <SelectItem value="opponent">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#ff4757]" />
                        Adversaire
                      </div>
                    </SelectItem>
                    <SelectItem value="coach">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#ffa502]" />
                        Coach
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <Separator orientation="vertical" className="h-8" />
            
            {/* Palette de couleurs */}
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-[#a1a8b0]" />
              <div className="flex gap-1">
                {colors.map((color) => (
                  <Tooltip key={color}>
                    <TooltipTrigger asChild>
                      <button
                        className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-110 ${
                          selectedColor === color ? 'border-[#00d4aa] ring-2 ring-[#00d4aa]/30' : 'border-[#3d4a5c]'
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setSelectedColor(color)}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Couleur: {color}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </div>
            
            <Separator orientation="vertical" className="h-8" />
            
            {/* Options d'affichage */}
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant={showGrid ? "default" : "outline"}
                onClick={() => setShowGrid(!showGrid)}
                className="gap-2"
              >
                <Grid3X3 className="w-4 h-4" />
                Grille
              </Button>
            </div>
          </div>
          
          {/* Templates d'exercices */}
          <div className="flex items-center gap-3 p-4 bg-[#283544] rounded-lg">
            <span className="text-sm text-[#a1a8b0]">Templates rapides:</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => loadTemplate('reception')}
              className="text-xs"
            >
              Réception
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => loadTemplate('attaque')}
              className="text-xs"
            >
              Attaque
            </Button>
          </div>

          {/* Canvas principal */}
          <div className="relative border-2 border-[#3d4a5c] rounded-xl overflow-hidden bg-gradient-to-br from-[#f0f9ff] to-[#e0f2fe] shadow-inner">
            <svg
              ref={svgRef}
              width="100%"
              height="500"
              viewBox="0 0 400 200"
              preserveAspectRatio="xMidYMid meet"
              className={`${
                currentTool === 'select' ? 'cursor-pointer' : 
                currentTool === 'arrow' || currentTool === 'zone' ? 'cursor-crosshair' : 
                'cursor-cell'
              } transition-all duration-200 field-editor-canvas`}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
            >
              {/* Grille */}
              {renderGrid()}
              
              {/* Terrain de base */}
              {fieldType === 'volleyball' && renderVolleyballField()}
              
              {/* Zones (rectangles) */}
              {fieldData.annotations.filter(a => a.type === 'zone').map((zone) => (
                <g key={zone.id}>
                  <rect
                    x={zone.x}
                    y={zone.y}
                    width={zone.width || 50}
                    height={zone.height || 30}
                    fill={zone.color}
                    fillOpacity="0.2"
                    stroke={zone.color}
                    strokeWidth="2"
                    strokeDasharray="5,5"
                    className="cursor-pointer hover:fill-opacity-30"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedElement(zone.id);
                    }}
                  />
                  <text
                    x={zone.x + (zone.width || 50) / 2}
                    y={zone.y + (zone.height || 30) / 2}
                    fontSize="10"
                    fill={zone.color}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontWeight="500"
                  >
                    {zone.text}
                  </text>
                </g>
              ))}
              
              {/* Flèches */}
              {fieldData.arrows.map((arrow) => (
                <g key={arrow.id}>
                  <defs>
                    <marker
                      id={`arrowhead-${arrow.id}`}
                      markerWidth="12"
                      markerHeight="8"
                      refX="12"
                      refY="4"
                      orient="auto"
                    >
                      <polygon
                        points="0 0, 12 4, 0 8"
                        fill={arrow.color}
                      />
                    </marker>
                  </defs>
                  <line
                    x1={arrow.startX}
                    y1={arrow.startY}
                    x2={arrow.endX}
                    y2={arrow.endY}
                    stroke={arrow.color}
                    strokeWidth={arrow.width}
                    strokeDasharray={arrow.style === 'dashed' ? '8,4' : 'none'}
                    markerEnd={`url(#arrowhead-${arrow.id})`}
                    className={`cursor-pointer hover:stroke-opacity-70 transition-all ${
                      selectedElement === arrow.id ? 'stroke-opacity-100 drop-shadow-lg' : ''
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedElement(arrow.id);
                    }}
                  />
                </g>
              ))}
              
              {/* Points/Joueurs/Ballon */}
              {fieldData.points.map((point) => (
                <g key={point.id}>
                  {point.type === 'ball' ? (
                    // Ballon avec effet
                    <g>
                      <circle
                        cx={point.x}
                        cy={point.y}
                        r={point.size + 2}
                        fill="none"
                        stroke={point.color}
                        strokeWidth="1"
                        strokeDasharray="2,2"
                        opacity="0.5"
                      />
                      <circle
                        cx={point.x}
                        cy={point.y}
                        r={point.size}
                        fill={point.color}
                        className={`cursor-pointer hover:scale-110 transition-transform ${
                          selectedElement === point.id ? 'drop-shadow-lg scale-110' : ''
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedElement(point.id);
                        }}
                      />
                    </g>
                  ) : (
                    // Joueurs avec numérotation
                    <g>
                      <circle
                        cx={point.x}
                        cy={point.y}
                        r={point.size}
                        fill={point.color}
                        stroke="white"
                        strokeWidth="2"
                        className={`cursor-pointer hover:scale-105 transition-transform ${
                          selectedElement === point.id ? 'drop-shadow-lg scale-105' : ''
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedElement(point.id);
                        }}
                      />
                      {point.type && (
                        <text
                          x={point.x}
                          y={point.y}
                          fontSize="8"
                          fill="white"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fontWeight="600"
                          pointerEvents="none"
                        >
                          {point.type === 'player' ? 'J' : point.type === 'opponent' ? 'A' : 'C'}
                        </text>
                      )}
                    </g>
                  )}
                </g>
              ))}
              
              {/* Annotations texte */}
              {fieldData.annotations.filter(a => a.type !== 'zone').map((annotation) => (
                <g key={annotation.id}>
                  <rect
                    x={annotation.x - 5}
                    y={annotation.y - annotation.fontSize - 2}
                    width={annotation.text.length * annotation.fontSize * 0.6 + 10}
                    height={annotation.fontSize + 6}
                    fill="white"
                    stroke={annotation.color}
                    strokeWidth="1"
                    rx="3"
                    fillOpacity="0.9"
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedElement(annotation.id);
                    }}
                  />
                  <text
                    x={annotation.x}
                    y={annotation.y}
                    fontSize={annotation.fontSize}
                    fill={annotation.color}
                    fontWeight="500"
                    className={`cursor-pointer select-none ${
                      selectedElement === annotation.id ? 'drop-shadow-sm' : ''
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedElement(annotation.id);
                    }}
                  >
                    {annotation.text}
                  </text>
                </g>
              ))}
              
              {/* Aperçu des éléments en cours de création */}
              {renderPreviewArrow()}
              
              {/* Informations de distance et angle pendant la création de flèches */}
              {currentTool === 'arrow' && isDrawing && startPoint && previewPos && (
                <g>
                  {(() => {
                    const distance = Math.sqrt((previewPos.x - startPoint.x) ** 2 + (previewPos.y - startPoint.y) ** 2);
                    const angle = Math.atan2(previewPos.y - startPoint.y, previewPos.x - startPoint.x) * 180 / Math.PI;
                    const midX = (startPoint.x + previewPos.x) / 2;
                    const midY = (startPoint.y + previewPos.y) / 2;
                    
                    return (
                      <g opacity="0.8">
                        <rect
                          x={midX - 25}
                          y={midY - 15}
                          width="50"
                          height="12"
                          fill="rgba(0, 0, 0, 0.8)"
                          rx="6"
                        />
                        <text
                          x={midX}
                          y={midY - 6}
                          fontSize="8"
                          fill="white"
                          textAnchor="middle"
                          fontWeight="500"
                        >
                          {Math.round(distance)}px
                        </text>
                      </g>
                    );
                  })()}
                </g>
              )}
            </svg>
            
            {/* Légende des couleurs de joueurs */}
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 border border-[#3d4a5c]/20">
              <div className="text-xs font-medium text-gray-700 mb-2">Légende</div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded-full bg-[#00d4aa]" />
                  <span>Joueurs</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded-full bg-[#ff4757]" />
                  <span>Adversaires</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded-full bg-[#ffa502]" />
                  <span>Ballon/Coach</span>
                </div>
              </div>
            </div>
          </div>

          {/* Panneau de contrôle de l'élément sélectionné */}
          {selectedElement && (
            <div className="flex items-center justify-between p-6 bg-[#283544] rounded-xl border border-[#3d4a5c]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#00d4aa]/20 flex items-center justify-center">
                  {selectedElement.includes('player') ? <Users className="w-4 h-4 text-[#00d4aa]" /> :
                   selectedElement.includes('ball') ? <Target className="w-4 h-4 text-[#ffa502]" /> :
                   selectedElement.startsWith('arrow') ? <ArrowRight className="w-4 h-4 text-[#3742fa]" /> :
                   selectedElement.startsWith('zone') ? <Grid3X3 className="w-4 h-4 text-[#ff4757]" /> :
                   <FileText className="w-4 h-4 text-[#a1a8b0]" />}
                </div>
                <div>
                  <Badge variant="secondary" className="mb-1">Élément sélectionné</Badge>
                  <p className="text-sm font-medium">{selectedElement}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="sm" variant="outline" onClick={duplicateElement}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Dupliquer (Ctrl+D)</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        const elementType = selectedElement.startsWith('point') || selectedElement.includes('player') || selectedElement.includes('ball') ? 'point' :
                                         selectedElement.startsWith('arrow') ? 'arrow' : 'annotation';
                        deleteElement(selectedElement, elementType);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Supprimer (Delete)</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          )}

          {/* Guide d'utilisation */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 bg-[#1e2731] rounded-xl border border-[#3d4a5c]">
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-[#00d4aa]">🎯 Outils principaux</h4>
              <div className="space-y-1 text-xs text-[#a1a8b0]">
                <div>• <strong>S</strong> - Mode sélection</div>
                <div>• <strong>P</strong> - Placer joueurs</div>
                <div>• <strong>B</strong> - Placer ballon</div>
                <div>• <strong>A</strong> - Dessiner flèches</div>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-[#00d4aa]">⌨️ Raccourcis</h4>
              <div className="space-y-1 text-xs text-[#a1a8b0]">
                <div>• <strong>Ctrl+Z</strong> - Annuler</div>
                <div>• <strong>Ctrl+Y</strong> - Refaire</div>
                <div>• <strong>Ctrl+D</strong> - Dupliquer</div>
                <div>• <strong>Delete</strong> - Supprimer</div>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-[#00d4aa]">📋 Actions</h4>
              <div className="space-y-1 text-xs text-[#a1a8b0]">
                <div>• Clic + glisser pour déplacer</div>
                <div>• Double-clic pour éditer</div>
                <div>• Maintenir Shift pour multi-sélection</div>
                <div>• Molette pour zoomer</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}