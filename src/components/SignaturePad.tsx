/**
 * "Leave a mark" canvas pad in the footer.
 *
 * Pointer-driven drawing on a small canvas. The result lives only in canvas
 * pixels — no localStorage, no upload. Pure decoration / play.
 *
 * Reduced motion: the canvas still works (drawing is a user action, not an
 * ambient animation), but the auto-fade trail is disabled.
 *
 * Why include it: the user asked for "as much drawable as possible". A small
 * sketchpad in the footer is a tasteful, contained way to signal that this
 * portfolio is hand-made and a little playful, without polluting the
 * professional sections above.
 */
import { useEffect, useRef, useState } from "react";
import { C, F, EASE } from "../tokens";

export function SignaturePad() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const [hasInk, setHasInk] = useState(false);
  const [dpr, setDpr] = useState(1);

  // Size the bitmap to the device pixel ratio for crisp lines on retina.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ratio = window.devicePixelRatio || 1;
    setDpr(ratio);
    const w = canvas.clientWidth, h = canvas.clientHeight;
    canvas.width = w * ratio;
    canvas.height = h * ratio;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(ratio, ratio);
    ctx.lineWidth = 1.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = C.accent;
    ctx.shadowColor = C.accent;
    ctx.shadowBlur = 4;
  }, []);

  function pos(e: React.PointerEvent<HTMLCanvasElement>): { x: number; y: number } {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function onDown(e: React.PointerEvent<HTMLCanvasElement>) {
    drawing.current = true;
    last.current = pos(e);
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx || !last.current) return;
    const p = pos(e);
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last.current = p;
    if (!hasInk) setHasInk(true);
  }

  function onUp(e: React.PointerEvent<HTMLCanvasElement>) {
    drawing.current = false;
    last.current = null;
    e.currentTarget.releasePointerCapture(e.pointerId);
  }

  function clear() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasInk(false);
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        marginTop: 12,
        marginBottom: 4,
      }}
    >
      <div
        style={{
          fontSize: 9,
          fontFamily: F.mono,
          color: C.faint,
          letterSpacing: 2,
          textTransform: "uppercase",
        }}
      >
        Leave a mark
      </div>
      <canvas
        ref={canvasRef}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        style={{
          width: 220,
          height: 70,
          background: C.surface,
          border: `1px dashed ${C.border}`,
          borderRadius: 8,
          touchAction: "none",
          cursor: "crosshair",
          transition: `border-color 240ms ${EASE.outExpo}`,
        }}
        aria-label="Sketch pad — drag to draw"
      />
      <button
        type="button"
        onClick={clear}
        disabled={!hasInk}
        style={{
          background: "transparent",
          border: "none",
          color: hasInk ? C.muted : C.faint,
          fontSize: 10,
          fontFamily: F.mono,
          letterSpacing: 1,
          cursor: hasInk ? "pointer" : "not-allowed",
          padding: "2px 8px",
        }}
      >
        clear
      </button>
      {/*
        Keep dpr in the DOM so the value is observable in devtools — it's
        otherwise easy to forget canvas was scaled and chase blur bugs.
      */}
      <span style={{ display: "none" }} data-dpr={dpr} />
    </div>
  );
}
