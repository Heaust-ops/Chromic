import { component$, useSignal } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Texture } from "~/core/glfx/core/texture";
import { GLFX } from "~/core/glfx/glfx";

export default component$(() => {
  const canvasRef = useSignal<HTMLCanvasElement>();

  return (
    <>
      <canvas
        ref={canvasRef}
        id="cnv"
        style={{
          pointerEvents: "none",
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
        }}
      ></canvas>
      <button
        onClick$={() => {
          const img = new Image();

          // Set the source of the image
          img.src = "/img.png";

          // Wait for the image to load
          img.onload = () => {
            const width = img.naturalWidth;
            const height = img.naturalHeight;
            const canvas = canvasRef.value!;
            canvas.width = width;
            canvas.height = height;
            // ctx.drawImage(img, 0, 0);
            const glfx = new GLFX(canvas);
            const texture = Texture.fromElement(glfx, img);
            glfx.draw(texture).brightnessContrast(0, 0.2).update();
            setInterval(() => {
              glfx
                .draw(texture)
                .brightnessContrast(0, Math.sin(Date.now() / 1000))
                .update();
            }, 16);
          };
        }}
      >
        Click ples
      </button>
    </>
  );
});

export const head: DocumentHead = {
  title: "Welcome to Qwik",
  meta: [
    {
      name: "description",
      content: "Qwik site description",
    },
  ],
};
