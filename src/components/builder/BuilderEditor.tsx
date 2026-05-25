"use client";
import React, { useState, useEffect, useRef } from 'react';
import Script from 'next/script';
import { Stage, Layer, Image as KonvaImage, Rect, Circle, Transformer } from 'react-konva';
import useImage from 'use-image';

type ShapeType = 'circle' | 'rectangle';

interface Placeholder {
  id: string;
  type: ShapeType;
  label: 'image' | 'name';
  x: number;
  y: number;
  width: number;
  height: number;
  radius?: number;
}

export default function BuilderEditor() {
  const [cvReady, setCvReady] = useState(false);
  const [imageUrl, setImageUrl] = useState('/templates/te_image&text.png');
  const [image] = useImage(imageUrl);
  const [placeholders, setPlaceholders] = useState<Placeholder[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const stageRef = useRef<any>(null);
  const trRef = useRef<any>(null);
  const hiddenCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (selectedId && trRef.current && stageRef.current) {
      const node = stageRef.current.findOne(`#${selectedId}`);
      if (node) {
        trRef.current.nodes([node]);
        trRef.current.getLayer().batchDraw();
      }
    } else if (trRef.current) {
      trRef.current.nodes([]);
      trRef.current.getLayer().batchDraw();
    }
  }, [selectedId]);

  const detectShapes = () => {
    if (!cvReady || !image || !hiddenCanvasRef.current) return;
    const cv = (window as any).cv;
    
    const canvas = hiddenCanvasRef.current;
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(image, 0, 0);

    const src = cv.imread(canvas);
    const gray = new cv.Mat();
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);
    
    const blurred = new cv.Mat();
    cv.GaussianBlur(gray, blurred, new cv.Size(5, 5), 0, 0, cv.BORDER_DEFAULT);

    const newPlaceholders: Placeholder[] = [];

    // Circle Detection
    const circles = new cv.Mat();
    cv.HoughCircles(
      blurred, circles, cv.HOUGH_GRADIENT,
      1, 50, 100, 30, 20, 300
    );

    if (circles.cols > 0) {
      for (let i = 0; i < circles.cols; ++i) {
        let x = circles.data32F[i * 3];
        let y = circles.data32F[i * 3 + 1];
        let radius = circles.data32F[i * 3 + 2];
        
        newPlaceholders.push({
          id: `circle-${i}`,
          type: 'circle',
          label: 'image',
          x,
          y,
          radius,
          width: radius * 2,
          height: radius * 2
        });
      }
    }

    // Rectangle Detection (Contour approximation)
    const edges = new cv.Mat();
    cv.Canny(blurred, edges, 50, 150, 3, false);
    
    const contours = new cv.MatVector();
    const hierarchy = new cv.Mat();
    cv.findContours(edges, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

    for (let i = 0; i < contours.size(); ++i) {
      const cnt = contours.get(i);
      const approx = new cv.Mat();
      cv.approxPolyDP(cnt, approx, 0.04 * cv.arcLength(cnt, true), true);
      
      const rect = cv.boundingRect(cnt);
      const area = cv.contourArea(cnt);
      
      if (area > 2000 && area < (image.width * image.height * 0.8)) {
        newPlaceholders.push({
          id: `rect-${i}`,
          type: 'rectangle',
          label: 'name',
          x: rect.x + rect.width / 2,
          y: rect.y + rect.height / 2,
          width: rect.width,
          height: rect.height
        });
      }
      
      cnt.delete();
      approx.delete();
    }

    setPlaceholders(newPlaceholders);

    src.delete(); gray.delete(); blurred.delete(); circles.delete();
    edges.delete(); contours.delete(); hierarchy.delete();
  };

  const handleDragEnd = (e: any) => {
    const id = e.target.id();
    const x = e.target.x();
    const y = e.target.y();
    setPlaceholders(prev => prev.map(p => p.id === id ? { ...p, x, y } : p));
  };

  const exportJSON = () => {
    const output = {
      template: imageUrl.split('/').pop(),
      placeholders: placeholders.map(p => ({
        type: p.type,
        label: p.label,
        x: Math.round(p.x),
        y: Math.round(p.y),
        width: Math.round(p.width),
        height: Math.round(p.height),
        radius: p.radius ? Math.round(p.radius) : undefined,
        confidence: 0.95
      }))
    };
    
    const blob = new Blob([JSON.stringify(output, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${output.template?.split('.')[0]}_config.json`;
    a.click();
  };

  return (
    <div className="flex flex-col gap-4">
      <Script 
        src="https://docs.opencv.org/4.10.0/opencv.js" 
        strategy="lazyOnload"
        onLoad={() => {
          const checkCv = setInterval(() => {
            if ((window as any).cv && (window as any).cv.Mat) {
              setCvReady(true);
              clearInterval(checkCv);
            }
          }, 100);
        }}
      />
      
      <div className="flex gap-4 mb-4 flex-wrap">
        <select 
          className="bg-gray-800 text-white px-4 py-2 rounded"
          value={imageUrl}
          onChange={(e) => {
            setImageUrl(e.target.value);
            setPlaceholders([]);
            setSelectedId(null);
          }}
        >
          <option value="/templates/te_image&text.png">te_image&text.png</option>
          <option value="/templates/template1_image&text.png">template1_image&text.png</option>
          <option value="/templates/template1_text.png">template1_text.png</option>
          <option value="/templates/template2_image&text.png">template2_image&text.png</option>
          <option value="/templates/template2_text.png">template2_text.png</option>
          <option value="/templates/template3_image&text.png">template3_image&text.png</option>
          <option value="/templates/template3_text.png">template3_text.png</option>
          <option value="/templates/template4_image&text.png">template4_image&text.png</option>
          <option value="/templates/template4_text.png">template4_text.png</option>
          <option value="/templates/template5_image&text.png">template5_image&text.png</option>
          <option value="/templates/template5_text.png">template5_text.png</option>
          <option value="/templates/template6_image&text.png">template6_image&text.png</option>
          <option value="/templates/template6_text.png">template6_text.png</option>
        </select>

        <button 
          onClick={detectShapes} 
          disabled={!cvReady || !image}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {cvReady ? 'اكتشاف العناصر تلقائيا' : 'جار تحميل OpenCV...'}
        </button>
        <button 
          onClick={() => {
            setPlaceholders([...placeholders, {
              id: `manual-rect-${Date.now()}`,
              type: 'rectangle',
              label: 'name',
              x: 150, y: 150, width: 200, height: 50
            }]);
          }}
          className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded"
        >
          + إضافة مربع نص
        </button>
        <button 
          onClick={() => {
            setPlaceholders([...placeholders, {
              id: `manual-circ-${Date.now()}`,
              type: 'circle',
              label: 'image',
              x: 150, y: 150, radius: 50, width: 100, height: 100
            }]);
          }}
          className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded"
        >
          + إضافة دائرة صورة
        </button>
        <button 
          onClick={exportJSON}
          className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded ml-auto"
        >
          تصدير JSON
        </button>
        
        {selectedId && (
          <button 
            onClick={() => setPlaceholders(p => p.filter(x => x.id !== selectedId))}
            className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded"
          >
            حذف المحدد
          </button>
        )}
      </div>

      <div className="bg-[#151A22] border border-gray-800 rounded-lg overflow-auto flex justify-start p-8 min-h-[600px]">
        <canvas ref={hiddenCanvasRef} style={{ display: 'none' }} />
        
        {image ? (
          <Stage 
            width={image.width} 
            height={image.height} 
            ref={stageRef}
            onMouseDown={(e) => {
              if (e.target === e.target.getStage() || e.target.hasName('bg-image')) {
                setSelectedId(null);
              }
            }}
          >
            <Layer>
              <KonvaImage 
                image={image} 
                name="bg-image"
              />
              {placeholders.map((p) => {
                const isSelected = p.id === selectedId;
                if (p.type === 'circle') {
                  return (
                    <Circle
                      key={p.id}
                      id={p.id}
                      x={p.x}
                      y={p.y}
                      radius={p.radius || 50}
                      fill="rgba(255, 0, 0, 0.3)"
                      stroke={isSelected ? "#00ff00" : "red"}
                      strokeWidth={2}
                      draggable
                      onClick={() => setSelectedId(p.id)}
                      onTap={() => setSelectedId(p.id)}
                      onDragEnd={handleDragEnd}
                      onTransformEnd={(e) => {
                        const node = e.target;
                        const scaleX = node.scaleX();
                        node.scaleX(1);
                        node.scaleY(1);
                        setPlaceholders(prev => prev.map(pl => {
                          if (pl.id === p.id) {
                            return {
                              ...pl,
                              radius: Math.max(5, (pl.radius || 0) * scaleX),
                              width: Math.max(5, pl.width * scaleX),
                              height: Math.max(5, pl.height * scaleX) // Keep circle aspect
                            };
                          }
                          return pl;
                        }));
                      }}
                    />
                  );
                }
                return (
                  <Rect
                    key={p.id}
                    id={p.id}
                    x={p.x - p.width/2}
                    y={p.y - p.height/2}
                    width={p.width}
                    height={p.height}
                    fill="rgba(0, 0, 255, 0.3)"
                    stroke={isSelected ? "#00ff00" : "blue"}
                    strokeWidth={2}
                    draggable
                    onClick={() => setSelectedId(p.id)}
                    onTap={() => setSelectedId(p.id)}
                    onDragEnd={(e) => {
                      const id = e.target.id();
                      const x = e.target.x() + e.target.width() / 2;
                      const y = e.target.y() + e.target.height() / 2;
                      setPlaceholders(prev => prev.map(p => p.id === id ? { ...p, x, y } : p));
                    }}
                    onTransformEnd={(e) => {
                      const node = e.target;
                      const scaleX = node.scaleX();
                      const scaleY = node.scaleY();
                      node.scaleX(1);
                      node.scaleY(1);
                      setPlaceholders(prev => prev.map(pl => {
                        if (pl.id === p.id) {
                          return {
                            ...pl,
                            width: Math.max(5, pl.width * scaleX),
                            height: Math.max(5, pl.height * scaleY),
                            x: node.x() + (pl.width * scaleX) / 2,
                            y: node.y() + (pl.height * scaleY) / 2
                          };
                        }
                        return pl;
                      }));
                    }}
                  />
                );
              })}
              <Transformer ref={trRef} boundBoxFunc={(oldBox, newBox) => newBox} />
            </Layer>
          </Stage>
        ) : (
          <div className="text-gray-500">جار تحميل التصميم...</div>
        )}
      </div>
    </div>
  );
}
