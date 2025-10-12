import React, { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Circle, Line, Arrow as KonvaArrow, Rect, Text } from 'react-konva';
import Konva from 'konva';

import { Player, Ball, Zone, Arrow } from '../../constants/exerciseEditor';
import { SportType, SPORTS_CONFIG } from '../../constants/sportsConfig';
import { ARROW_TYPES, ArrowActionType } from '../../constants/arrowTypes';

interface KonvaFieldProps {
  sport: SportType;
  courtRef: React.RefObject<HTMLDivElement>;
  selectedTool: string;
  showGrid: boolean;
  players: Player[];
  arrows: Arrow[];
  balls: Ball[];
  zones: Zone[];
  selectedElement: string | null;
  onElementSelect: (id: string) => void;
  onCourtClick: (e: any) => void;
  displayMode: 'role' | 'number';
  creationStart: { x: number; y: number } | null;
  currentMousePos: { x: number; y: number } | null;
  onPlayerUpdate?: (id: string, position: { x: number; y: number }) => void;
  onBallUpdate?: (id: string, position: { x: number; y: number }) => void;
  onZoneUpdate?: (id: string, position: { x: number; y: number }) => void;
  onMouseDown?: (pos: { x: number; y: number }) => void;
  onMouseMove?: (pos: { x: number; y: number }) => void;
  onMouseUp?: () => void;
}

export function KonvaField({
  sport,
  courtRef,
  selectedTool,
  showGrid,
  players,
  arrows,
  balls,
  zones,
  selectedElement,
  onElementSelect,
  onCourtClick,
  displayMode,
  creationStart,
  currentMousePos,
  onPlayerUpdate,
  onBallUpdate,
  onZoneUpdate,
  onMouseDown,
  onMouseMove,
  onMouseUp,
}: KonvaFieldProps) {
  const stageRef = useRef<Konva.Stage>(null);
  const [stageSize, setStageSize] = useState({ width: 600, height: 600 });
  const sportConfig = SPORTS_CONFIG[sport];

  // Responsive stage sizing
  useEffect(() => {
    const updateSize = () => {
      if (courtRef.current) {
        const width = courtRef.current.offsetWidth;
        const height = courtRef.current.offsetHeight;
        setStageSize({ width, height });
      }
    };

    // Initial size
    updateSize();

    // Add resize listener
    window.addEventListener('resize', updateSize);

    // Use ResizeObserver for better reactivity
    const resizeObserver = new ResizeObserver(updateSize);
    if (courtRef.current) {
      resizeObserver.observe(courtRef.current);
    }

    return () => {
      window.removeEventListener('resize', updateSize);
      resizeObserver.disconnect();
    };
  }, [courtRef]);

  // Convert percentage to pixels
  const toPixels = (percent: number, dimension: 'width' | 'height') => {
    return (percent / 100) * (dimension === 'width' ? stageSize.width : stageSize.height);
  };

  // Convert pixels to percentage
  const toPercent = (pixels: number, dimension: 'width' | 'height') => {
    return (pixels / (dimension === 'width' ? stageSize.width : stageSize.height)) * 100;
  };

  // Render grid
  const renderGrid = () => {
    if (!showGrid) return null;

    const gridLines: JSX.Element[] = [];
    const gridSize = 50; // 50px grid

    // Vertical lines
    for (let i = 0; i <= stageSize.width; i += gridSize) {
      gridLines.push(
        <Line
          key={`v-${i}`}
          points={[i, 0, i, stageSize.height]}
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={1}
        />
      );
    }

    // Horizontal lines
    for (let i = 0; i <= stageSize.height; i += gridSize) {
      gridLines.push(
        <Line
          key={`h-${i}`}
          points={[0, i, stageSize.width, i]}
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={1}
        />
      );
    }

    return gridLines;
  };

  // Render players
  const renderPlayers = () => {
    return players.map((player) => {
      const x = toPixels(player.position.x, 'width');
      const y = toPixels(player.position.y, 'height');
      const isSelected = selectedElement === player.id;
      const roleColor = sportConfig.roleColors[player.role] || '#3b82f6';
      const label = displayMode === 'number' ? player.number?.toString() || '?' : player.role;

      return (
        <React.Fragment key={player.id}>
          <Circle
            x={x}
            y={y}
            radius={isSelected ? 18 : 16}
            fill={roleColor}
            stroke={isSelected ? '#00d4aa' : '#ffffff'}
            strokeWidth={isSelected ? 3 : 2}
            shadowColor="black"
            shadowBlur={10}
            shadowOpacity={0.3}
            draggable={selectedTool === 'select'}
            onClick={() => onElementSelect(player.id)}
            onTap={() => onElementSelect(player.id)}
            onDragEnd={(e) => {
              // TODO: Update player position
              const newX = toPercent(e.target.x(), 'width');
              const newY = toPercent(e.target.y(), 'height');
              console.log('Player moved to:', newX, newY);
            }}
          />
          <Text
            x={x}
            y={y}
            text={label}
            fontSize={12}
            fontFamily="Arial"
            fontStyle="bold"
            fill="#ffffff"
            align="center"
            verticalAlign="middle"
            offsetX={label.length * 3}
            offsetY={6}
            listening={false}
          />
        </React.Fragment>
      );
    });
  };

  // Render balls
  const renderBalls = () => {
    return balls.map((ball) => {
      const x = toPixels(ball.position.x, 'width');
      const y = toPixels(ball.position.y, 'height');
      const isSelected = selectedElement === ball.id;

      return (
        <Circle
          key={ball.id}
          x={x}
          y={y}
          radius={isSelected ? 12 : 10}
          fill="#f59e0b"
          stroke={isSelected ? '#00d4aa' : '#ffffff'}
          strokeWidth={isSelected ? 3 : 2}
          shadowColor="black"
          shadowBlur={8}
          shadowOpacity={0.3}
          draggable={selectedTool === 'select'}
          onClick={() => onElementSelect(ball.id)}
          onTap={() => onElementSelect(ball.id)}
          onDragEnd={(e) => {
            // TODO: Update ball position
          }}
        />
      );
    });
  };

  // Render zones
  const renderZones = () => {
    return zones.map((zone) => {
      const x = toPixels(zone.position.x, 'width');
      const y = toPixels(zone.position.y, 'height');
      const width = toPixels(zone.width || 20, 'width');
      const height = toPixels(zone.height || 20, 'height');
      const isSelected = selectedElement === zone.id;

      return (
        <Rect
          key={zone.id}
          x={x}
          y={y}
          width={width}
          height={height}
          fill={zone.color ? `${zone.color}40` : '#3b82f640'}
          stroke={isSelected ? '#00d4aa' : zone.color || '#3b82f6'}
          strokeWidth={isSelected ? 3 : 2}
          dash={[10, 5]}
          draggable={selectedTool === 'select'}
          onClick={() => onElementSelect(zone.id)}
          onTap={() => onElementSelect(zone.id)}
          onDragEnd={(e) => {
            // TODO: Update zone position
          }}
        />
      );
    });
  };

  // Render arrows with Bezier curves
  const renderArrows = () => {
    return arrows.map((arrow) => {
      const startX = toPixels(arrow.startPosition.x, 'width');
      const startY = toPixels(arrow.startPosition.y, 'height');
      const endX = toPixels(arrow.endPosition.x, 'width');
      const endY = toPixels(arrow.endPosition.y, 'height');

      const actionType = arrow.actionType || 'pass';
      const arrowConfig = ARROW_TYPES[actionType];
      const isSelected = selectedElement === arrow.id;

      // Calculate control point for quadratic curve
      let points: number[];

      if (arrow.isCurved && arrow.controlX !== undefined && arrow.controlY !== undefined) {
        // Custom control point
        const controlX = toPixels(arrow.controlX, 'width');
        const controlY = toPixels(arrow.controlY, 'height');
        points = [startX, startY, controlX, controlY, endX, endY];
      } else if (arrow.isCurved) {
        // Auto-calculate control point (arc in the middle)
        const midX = (startX + endX) / 2;
        const midY = (startY + endY) / 2;
        const dx = endX - startX;
        const dy = endY - startY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const offset = distance * 0.2; // 20% curve

        // Perpendicular offset
        const controlX = midX + (dy / distance) * offset;
        const controlY = midY - (dx / distance) * offset;

        points = [startX, startY, controlX, controlY, endX, endY];
      } else {
        // Straight line
        points = [startX, startY, endX, endY];
      }

      return (
        <React.Fragment key={arrow.id}>
          {arrow.isCurved ? (
            <Line
              points={points}
              stroke={isSelected ? '#00d4aa' : arrowConfig.color}
              strokeWidth={isSelected ? arrowConfig.width + 1 : arrowConfig.width}
              dash={arrowConfig.dashArray !== 'none' ? arrowConfig.dashArray.split(',').map(Number) : undefined}
              tension={0.5} // Bezier curve tension
              lineCap="round"
              lineJoin="round"
              shadowColor="black"
              shadowBlur={4}
              shadowOpacity={0.3}
              onClick={() => onElementSelect(arrow.id)}
              onTap={() => onElementSelect(arrow.id)}
            />
          ) : (
            <KonvaArrow
              points={points}
              stroke={isSelected ? '#00d4aa' : arrowConfig.color}
              strokeWidth={isSelected ? arrowConfig.width + 1 : arrowConfig.width}
              dash={arrowConfig.dashArray !== 'none' ? arrowConfig.dashArray.split(',').map(Number) : undefined}
              fill={arrowConfig.color}
              pointerLength={8}
              pointerWidth={8}
              shadowColor="black"
              shadowBlur={4}
              shadowOpacity={0.3}
              onClick={() => onElementSelect(arrow.id)}
              onTap={() => onElementSelect(arrow.id)}
            />
          )}

          {/* Control point handle (shown when selected and curved) */}
          {isSelected && arrow.isCurved && points.length === 6 && (
            <Circle
              x={points[2]}
              y={points[3]}
              radius={6}
              fill="#00d4aa"
              stroke="#ffffff"
              strokeWidth={2}
              draggable
              onDragMove={(e) => {
                // TODO: Update control point in real-time
                console.log('Control point moved:', e.target.x(), e.target.y());
              }}
            />
          )}
        </React.Fragment>
      );
    });
  };

  // Render preview arrow during creation
  const renderPreviewArrow = () => {
    if (!creationStart || !currentMousePos || !selectedTool.startsWith('arrow-')) {
      return null;
    }

    const startX = toPixels(creationStart.x, 'width');
    const startY = toPixels(creationStart.y, 'height');
    const endX = toPixels(currentMousePos.x, 'width');
    const endY = toPixels(currentMousePos.y, 'height');

    const actionType = selectedTool.replace('arrow-', '') as ArrowActionType;
    const arrowConfig = ARROW_TYPES[actionType];

    return (
      <KonvaArrow
        points={[startX, startY, endX, endY]}
        stroke={arrowConfig.color}
        strokeWidth={arrowConfig.width}
        dash={arrowConfig.dashArray !== 'none' ? arrowConfig.dashArray.split(',').map(Number) : undefined}
        fill={arrowConfig.color}
        pointerLength={8}
        pointerWidth={8}
        opacity={0.6}
        listening={false}
      />
    );
  };

  const handleStageMouseDown = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    const stage = e.target.getStage();
    if (!stage) return;

    const pos = stage.getPointerPosition();
    if (!pos) return;

    const percentX = toPercent(pos.x, 'width');
    const percentY = toPercent(pos.y, 'height');

    onMouseDown?.({ x: percentX, y: percentY });
  };

  const handleStageMouseMove = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    const stage = e.target.getStage();
    if (!stage) return;

    const pos = stage.getPointerPosition();
    if (!pos) return;

    const percentX = toPercent(pos.x, 'width');
    const percentY = toPercent(pos.y, 'height');

    onMouseMove?.({ x: percentX, y: percentY });
  };

  const handleStageMouseUp = () => {
    onMouseUp?.();
  };

  return (
    <div
      ref={courtRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        backgroundImage: `url(/assets/courts/${sport}/${sport}-court-dark.webp)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <Stage
        ref={stageRef}
        width={stageSize.width}
        height={stageSize.height}
        onMouseDown={handleStageMouseDown}
        onTouchStart={handleStageMouseDown}
        onMouseMove={handleStageMouseMove}
        onTouchMove={handleStageMouseMove}
        onMouseUp={handleStageMouseUp}
        onTouchEnd={handleStageMouseUp}
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        <Layer>
          {renderGrid()}
          {renderZones()}
          {renderArrows()}
          {renderBalls()}
          {renderPlayers()}
          {renderPreviewArrow()}
        </Layer>
      </Stage>
    </div>
  );
}
